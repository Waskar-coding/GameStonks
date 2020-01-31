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
const steamAuth = require('./steam_auth/auth');
const config = require('./local_auth/config');
const User = require('./object_db/user_db');

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
app.use(express.static(__dirname + '/../../public'));

app.get('/', function(req, res){
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
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
        apiKey: '24E7A4CB6C2041D4C08EC325A5F4FFC3'
    },
    function(identifier, profile) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Steam profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Steam account with a user record in your database,
            // and return that user instead.
            profile.identifier = identifier;
            User.findOne({steamid: profile._json.steamid}, function(err, user) {
                if (user === null)
                {
                    if(verifyUser(profile._json)) {
                        registerNewUser(profile._json)
                    }
                    else {
                        blacklistNewUser(profile._json)
                    }
                }
                else {
                    if (user.permanent_ban || user.banned){
                        console.log("Banned account");
                        return false
                    }
                    const valid = verifyUser(profile._json);
                    if(valid &&(user.blacklisted)){
                        const today = new Date(0);
                        User.findOneAndUpdate({steamid: user.steamid}, {joined: today.setUTCSeconds(profile._json.timecreated),
                            blacklisted: false}).then(function (response) {
                                console.log("This account is now valid");
                                createToken(user.steamid);
                                return(response);
                        });
                    }
                    else if (!valid &&(user.blacklisted)){
                        User.findOneAndUpdate({steamid: user.steamid}, {blacklisted: false,
                            permanent_ban: true}).then(function (response) {
                            console.log("This account is still invalid");
                            return(response);
                        });
                    }
                    else if (!user.banned && !user.permanent_ban){
                        console.log("Valid account");
                        createToken(user.steamid);
                        return true
                    }

                }
            });

        });
    }
));

function verifyUser(user) {
    const timeCreated = user.timecreated;
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const difference = currentTime - timeCreated;
    if(timeCreated === undefined){
        console.log("This account is private");
        return false
    }
    if( difference < 31556952)
    {
        console.log("This account is too recent");
        return  false
    }
    request('https://dog.steamcalculator.com/v1/id/'+ user.steamid +'/apps', { json: true }, (err, res) => {
        if (err) { return console.log(err); }
        const accountValue = res.body.total_value.amount/100;
        if (accountValue < 20) {
        console.log("This account is not valuable enough");
        return false
        }});
        console.log("This account is valid");
        return true
}

function registerNewUser(user) {
    const timeCreated = user.timecreated;
    const today = new Date(0);
    const newUser = new User ({
        steamid : user.steamid,
        name : user.personaname,
        joined : today.setUTCSeconds(timeCreated),
        thumbnail: user.avatarfull,
        current_strikes: 0,
        banned: false,
        blacklisted: false,
        permanent_ban: false,
    });
    newUser.save().then(function () {
        console.log("User successfully registered");
        createToken(user.steamid);
    });
}

function blacklistNewUser(user){
    const timeCreated = user.timecreated;
    today = new Date(0);
    const newUser = new User ({
        steamid : user.steamid,
        name : user.personaname,
        joined : today.setUTCSeconds(timeCreated),
        thumbnail: user.avatarfull,
        current_strikes: 0,
        banned: false,
        blacklisted:true,
        permanent_ban: false,
    });
    newUser.save().then(function () {
        console.log("User successfully registered and blacklisted")
    });
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

function createToken (steamid) {
    // create a token
    return jwt.sign({id: steamid}, config.secret, {
        expiresIn: 86400 // expires in 24 hours
    })
}

////Game API
app.use("/games",gameGet);
app.use("/users",userGet);
app.use('/steam_auth', steamAuth);
app.listen(80, function () {
    console.log('App listening on port 80!!')
});
