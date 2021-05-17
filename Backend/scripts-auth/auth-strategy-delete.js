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
    {returnURL: 'http://localhost:8080/steam_auth/login-delete/return', realm: 'http://localhost:8080/', apiKey: APIKEY},
    (identifier, profile, done) => {
        process.nextTick(() => {
            profile.identifier = identifier;
            User.findOne({steamid: profile._json.steamid})
                .then(user => {
                    ////New users
                    if(user === null){ done(null, ({notifyType: 'delete-404', notifyData: {}}))}
                    ////Regular users
                    else { done(null, ({user: {steamid: profile._json.steamid}, notifyType: 'delete', notifyData: {}}))}
                })
                .catch(() => {return done(null, ({user: null}))})
        });
    }
)