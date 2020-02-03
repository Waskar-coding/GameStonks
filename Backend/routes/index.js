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

app.get('/wrong', function(req, res){
    res. redirect('/games/getprioritary');
    //res.render('index', { user: req.user });
});

app.get('/account', steamAuth.ensureAuthenticated, function(req, res){
    res. redirect('/users/finduser/'+ req.user.user.name);
    //res.render('index', { user: req.user });
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/', function (req, res) {
    res.send("Bruh")
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
    function(identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Steam profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Steam account with a user record in your database,
            // and return that user instead.
            profile.identifier = identifier;
            User.findOne({steamid: profile._json.steamid}, function(err, user) {
                ////New Users
                if (user === null){
                    createNewUser(profile._json,verifyUser(profile._json));
                    const today = new Date();
                    const steamUser = {
                        steamid : profile._json.steamid,
                        name : profile._json.personaname,
                        joined : today,
                        timecreated: profile._json.timecreated,
                        thumbnail: profile._json.avatarfull,
                        current_strikes: 0,
                        banned: false
                    };
                    const newUser ={
                        user: steamUser,
                        token: createToken(profile._json.steamid)
                    };
                    return done(null,newUser);
                }

                ////Banned users
                else if (user.banned) {
                    const currentBan = findBan(user);
                    const today = new Date();
                    const dictBan = {
                        B01: verifyUser(user),
                        B02: true
                    };
                    user.banned = dictBan[currentBan.ban_type];
                    currentBan.ban_active = dictBan[currentBan.ban_type];
                    currentBan.ban_end = today;
                    user.save().then(function (user) {
                        if (!currentBan.ban_active){
                            console.log("User successfully unbanned");
                            return done(null, ({user: user,token:createToken(user.steamid) }));
                        }
                        else {
                            console.log("User is still banned");
                            return done(null, ({user: user}));
                        }
                    });
                }

                ////Regular users
                else {
                    console.log("Valid account");
                    return done(null, ({user: user,token:createToken(user.steamid) }));
                }
            });
        });
    }
));



//Finding the active ban
function findBan(user){
    for (let ban of user.bans){
        if (ban.ban_active===true){
            return ban
        }
    }
}



//Verifying user validity
function verifyUser(user) {
    ////Checking if the account is private and old enough
    const timeCreated = user.timecreated;
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const difference = currentTime - timeCreated;
    if(timeCreated === undefined){
        console.log("This account is private");
        return true
    }
    if( difference < 31556952)
    {
        console.log("This account is too recent");
        return true
    }
    ////Using steamcalculator to check the value of the account
    request('https://dog.steamcalculator.com/v1/id/'+ user.steamid +'/apps', { json: true }, (err, res) => {
        if (err) { return console.log(err); }
        const accountValue = res.body.total_value.amount/100;
        if (accountValue < 20) {
        console.log("This account is not valuable enough");
        return true
        }});
        console.log("This account is valid");
        return false
}



//Creating user mongo model
function createNewUser(user,banned){
    ////Creating user account
    const today = new Date();
    const newUser = new User ({
        steamid : user.steamid,
        name : user.personaname,
        joined : today,
        timecreated: user.timecreated,
        thumbnail: user.avatarfull,
        current_strikes: 0,
        banned: banned
    });

    if (banned){
        ////Creating a ban register
        newUser.bans.push({
            ban_start: today,
            ban_type: "B01",
            ban_doc: "B01_1",
            ban_active: true
        });
    }

    newUser.save().then(function () {
        console.log("User successfully registered, banned: " + banned);
        return newUser.toJSON();
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
