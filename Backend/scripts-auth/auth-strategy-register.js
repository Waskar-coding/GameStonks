//Packages
const SteamStrategy = require('passport-steam').Strategy;

//Local schemas
const User = require('../schemas/schema-user');

//Auth files
const APIKEY = process.env.STEAM_PERSONAL_APIKEY.toString();
const createNewUser = require('./auth-create');
const createToken = require('./auth-token');
const defaultUserConfig = require('./auth-session-headers');

//Main function
module.exports = new SteamStrategy(
    {returnURL: 'http://localhost:8080/steam_auth/register/return', realm: 'http://localhost:8080/', apiKey: APIKEY},
    (identifier, profile, done) => {
        process.nextTick(() => {
            profile.identifier = identifier;
            User.findOne({steamid: profile._json.steamid})
                .then(async user => {
                    ////Regular users
                    if(user !== null) done(null,({notifyType: 'prev-register', notifyData: {}}));
                    ////New users
                    else {
                        const B01CheckingFunction = require('../scripts-ban/ban-B01-check');
                        const isBanned = await B01CheckingFunction(profile._json);
                        await createNewUser(profile._json, isBanned)
                            .then(newUser => {
                                if(newUser.banned === true) return done(null, ({notifyType: 'B01-new', notifyData: {}}))
                                else return done(null, (
                                    {
                                        user: defaultUserConfig(newUser),
                                        token: createToken(newUser.steamid),
                                        notifyType: 'welcome',
                                        notifyData: {}
                                    }
                                ))
                            })
                    }
                })
                .catch(() => done(null, ({user: null})))
        });
    }
)