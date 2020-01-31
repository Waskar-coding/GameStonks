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

////Local
const game = require('./object_db/game_db');
const user = require('./object_db/user_db');
const gameGet = require('./getter_db/game_get');
const userGet = require('./getter_db/user_get');
const authRoutes = require('./auth/auth');



//Initializing stuff
////Express
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin",  "*");
    res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Headers', "Content-Type, Authorization, Content-Length, X-Requested-With,X-Custom-Header,Origin");
    res.header('Access-Control-Allow-Credentials',"true");
    next();
});

////MongoDB
mongoose.connect("mongodb://192.168.1.40:27017/SteamDB", function (err) {
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
        returnURL: 'http://localhost/auth/steam/return',
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
            const timeCreated = profile._json.timecreated;
            if (timeCreated !== undefined) {
                const currentTime = Math.round((new Date()).getTime() / 1000);
                const difference = currentTime - timeCreated;
                 if( difference < 31556952)
                 {
                     console.log("This account is too recent")
                 }
                else {
                    request('https://dog.steamcalculator.com/v1/id/'+ profile._json.steamid +'/apps', { json: true }, (err, res) => {
                        if (err) { return console.log(err); }
                        const accountValue = res.body.total_value.amount/100;
                        if (accountValue >= 20){
                            console.log("This account is valid")
                     }
                        else {
                            console.log("This account is not valuable enough")
                        }
                    });
                }
            }
            else (
                console.log("This account is private")
            );
        });
    }
));

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

////Game API
app.use("/games",gameGet);
app.use("/users",userGet);
app.use('/auth', authRoutes);
app.listen(80, function () {
    console.log('App listening on port 80!!')
});
