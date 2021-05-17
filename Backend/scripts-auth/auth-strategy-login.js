//Packages
const SteamStrategy = require('passport-steam').Strategy;

//Local schemas
const User = require('../schemas/schema-user');

//Auth files
const APIKEY = process.env.STEAM_PERSONAL_APIKEY.toString();
const createToken = require('./auth-token');
const defaultUserConfig = require('./auth-session-headers');

//Main function
module.exports = new SteamStrategy(
    {returnURL: 'http://localhost:8080/steam_auth/login/return', realm: 'http://localhost:8080/', apiKey: APIKEY},
    (identifier, profile, done) => {
        //asynchronous verification, for effect...
        process.nextTick(() => {
            /*
            To keep the example simple, the user's Steam profile is returned to
            represent the logged-in user.  In a typical application, you would want
            to associate the Steam account with a user record in your database,
            and return that user instead.
            */
            profile.identifier = identifier;
            User.findOne({steamid: profile._json.steamid})
                .then(async user => {
                    ////New users
                    if(user === null){
                        done(null,
                            ({
                                notifyType: 'new-login',
                                notifyData: {}
                            })
                        );
                    }
                    ////Banned users
                    else if (user.banned) {
                        const currentBan = user.ban;
                        const banType = user.ban.ban_type;
                        const banCheckingFunction = require(`../scripts-ban/ban-${banType}-check`);
                        const isBanned = await banCheckingFunction(user, currentBan);
                        if(isBanned === false){
                            User.findOneAndUpdate({steamid: user.steamid},{
                                $set: {
                                    banned: false, ban: {}, name: profile._json.personaname, strikes: [],
                                    thumbnail: profile._json.avatarfull, profile_url: profile._json.profileurl
                                },
                                $push: {general_timeline: [[new Date(),'U',banType]]}
                            }, {new: true})
                                .then(newUser => {console.log('Unbanned');done(
                                    null,
                                    ({
                                        user: defaultUserConfig(newUser),
                                        token: createToken(newUser.steamid),
                                        notifyType: `${banType}-unbanned`,
                                        notifyData: {}
                                    })
                                )})
                        }
                        else{
                            return done(
                                null,
                                ({
                                    notifyType: currentBan.ban_type,
                                    notifyData: {
                                        register: currentBan,
                                        action: user.general_timeline[user.general_timeline.length-1]
                                    }
                                })
                            )
                        }
                    }
                    ////Regular users
                    else {
                        User.findOneAndUpdate({steamid: user.steamid},{
                            $set: {
                                name: profile._json.personaname, thumbnail: profile._json.avatarfull,
                                profile_url: profile._json.profileurl
                            }
                        }).then(user => {return done(null, ({
                            user: defaultUserConfig(user),
                            token: createToken(user.steamid),
                            notifyType: '',
                            notifyData: {}
                        }))})
                    }
                })
                .catch(() => {return done(null, ({user: null}))})
        });
    }
)