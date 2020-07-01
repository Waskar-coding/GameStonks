//Imports
////Packages
const express = require('express');
const session = require ('express-session');
const bodyParser = require('body-parser');
const request = require('request');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const jwt = require('jsonwebtoken');

////Local
const gameGet = require('./getter_db/game_get');
const userGet = require('./getter_db/user_get');
const jackGet = require('./getter_db/jackpot_get');
const eventGet = require('./getter_db/event_get');
const steamAuth = require('./steam_auth/auth');
const config = require('./local_auth/config');
const User = require('./object_db/user_db');
const APIKEY = process.env.STEAM_PERSONAL_APIKEY;

//Initializing stuff
////Express
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin",  "*");
    res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Headers', "Content-Type, Authorization, Content-Length, " +
        "X-Requested-With,X-Custom-Header,X-Access-Token,Origin");
    res.header('Access-Control-Allow-Credentials',"true");
    next();
});

////MongoDB
mongoose.connect("mongodb://localhost:27017/SteamDB", function (err) {
    if (!err) {
        console.log("We are connected")
    }
    else{
        console.log(err)
    }
});

////Express Session
app.use(session({
    secret: 'your secret',
    name: 'name of session id',
    resave: true,
    saveUninitialized: true}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/../../public'));

app.get('/wrong', function(req, res){
    res.redirect('/games/getprioritary');
    //res.render('index', { user: req.user });
});

app.get('/account', steamAuth.ensureAuthenticated, function(req, res){
    User.findOne({steamid: req.user.user.steamid},function(err,user){
       if(!err){
           if (user.banned){
               res.redirect('/logout')
           }
           else{
               res.redirect('http://localhost:3000/users/profiles/my_profile');
           }
       }
    });
});

app.get('/logout', function(req, res){
    if(req.user.banType){
        const banType = req.user.banType;
        req.logout();
        res.send({Banned: banType})
    }
    else{
        req.logout();
        res.send({message: 'User logged out'})
    }
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

//// Steam Passport
passport.use(new SteamStrategy({
        returnURL: 'http://localhost/steam_auth/auth/return',
        realm: 'http://localhost/',
        apiKey: APIKEY
    },
    function(identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Steam profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Steam account with a user record in your database,
            // and return that user instead.
            profile.identifier = identifier;
            User.findOne({steamid: profile._json.steamid})
                .then(user => {
                    ////New users
                    if (user === null){
                        createNewUser(profile._json,verifyUser(profile._json))
                            .then(user => {
                                if(user.banned === true){
                                    return done(null, ({user: user, banType: 'B01'}));
                                }
                                else{
                                    return done(null, ({user: user, token:createToken(user.steamid)}))
                                }
                            });
                    }
                    ////Banned users
                    else if (user.banned) {
                        const currentBan = user.ban;
                        const today = new Date();
                        const dictBan = {
                            B01: verifyUser,
                            B02: verifyTime
                        };
                        if(dictBan[currentBan.ban_type](user,currentBan) === false){
                            User.findOneAndUpdate({steamid: user.steamid},{
                                $set: {
                                    banned: false,
                                    ban: {},
                                    name: profile._json.personaname,
                                    thumbnail: profile._json.avatarfull,
                                    profile_url: profile._json.profileurl
                                },
                                $push: {
                                    general_timeline: [
                                        new Date(),
                                        'U',
                                        currentBan.ban_type,
                                        null
                                    ]
                                }
                            })
                                .then(user => {done(null, ({user: user,token:createToken(user.steamid)}))})
                        }
                        else{
                            return done(null, ({user: user, banType: 'B01'}));
                        }
                    }

                    ////Regular users
                    else {
                        User.findOneAndUpdate({steamid: user.steamid},{
                           $set: {
                               name: profile._json.personaname,
                               thumbnail: profile._json.avatarfull,
                               profile_url: profile._json.profileurl
                           }
                        })
                            .then(user => {return done(null, ({user: user,token:createToken(user.steamid) }))})
                    }
                })
                .catch(err => {
                    return done(null, ({user: null}));
                })
        });
    }
));



//Verifying user validity
function verifyUser(user) {
    ////Checking if the account is private and old enough
    const timeCreated = user.timecreated;
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const difference = currentTime - timeCreated;
    if(timeCreated === undefined){
        return true
    }
    //
    if( difference < 31556952)
    {
        return true
    }
    ////Using steamcalculator to check the value of the account
    request('https://dog.steamcalculator.com/v1/id/'+ user.steamid +'/apps', { json: true }, (err, res) => {
        if (err) { return console.log(err); }
        const accountValue = res.body.total_value.amount/100;
        if (accountValue < 20) {
        return true
        }});
        return false
}



//Verify user ban time has passed
function verifyTime(user,ban){
    const today = new Date();
    return today < ban.ban_end
}



//Creating user mongo model
function createNewUser(user,banned){
    return new Promise(resolve => {
        ////Creating user account
        const today = new Date();
        const newUser = new User ({
            steamid : user.steamid,
            name : user.personaname,
            joined : today,
            wealth: 0,
            wealth_timetable: [new Date(), 0],
            general_timetable: [
                [
                   new Date(),
                   "D",
                   "E"
                ]
            ],
            timecreated: user.timecreated,
            thumbnail: user.avatarfull,
            profile_url: user.profileurl,
            banned: banned
        });
        if (banned){
            ////Creating a ban register
            newUser.ban = ({
                ban_start: today,
                ban_type: "B01"
            });
        }
        else{
            newUser.ban = {};
        }
        newUser.save().then(user => {
            resolve(user);
        });
    });
}


//Creating a Token
function createToken (steamid) {
    // create a token
    return jwt.sign({id: steamid}, config.secret, {
        expiresIn: 86400 // expires in 24 hours
    })
}

////Game API
app.use("/games",gameGet);

//User API
app.use("/users",userGet);

//Jackpot API
app.use('/jackpots',jackGet);

//Event API
app.use('/events',eventGet);

//Auth API
app.use('/steam_auth', steamAuth.router);


app.listen(80, function () {
    console.log('App listening on port 80!!')
});
