//Packages
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require ('express-session');

//Local routers
const routerAuth = require('./routes/routes-auth');
const routerDoc = require('./routes/routes-doc');
const routerEvent = require('./routes/routes-event');
const routerSurvey = require('./routes/routes-survey');
const routerUser = require('./routes/routes-user');
const routerTrade = require('./routes/routes-trade');

//Auth main function
const authDelete = require('./scripts-auth/auth-strategy-delete');
const authLogin = require('./scripts-auth/auth-strategy-login');
const authRegister = require('./scripts-auth/auth-strategy-register');

//Express configuration
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin",  "*");
    res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Headers', "Content-Type, Authorization, Content-Length, " +
        "X-Requested-With,X-Custom-Header,X-Access-Token,Origin");
    res.header('Access-Control-Allow-Credentials',"true");
    next();
});

//Express Session
app.use(session({secret: 'your secret', name: 'name of session id', resave: true, saveUninitialized: true}));

//MongoDB configuration
mongoose.connect(
    "mongodb://localhost:27017/SteamDB",
    {useNewUrlParser: true, useUnifiedTopology: true},
    (err) => { console.log(err? err : "We are connected")
});
mongoose.set('useFindAndModify', false);

//Passport initialization
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/../../public'));

//Passport configuration
passport.serializeUser((user, done) => {done(null, user)});
passport.deserializeUser((obj, done) => {done(null, obj)});
passport.use('steam-delete', authDelete);
passport.use('steam-login', authLogin);
passport.use('steam-register', authRegister);

//Router API
app.use('/steam_auth', routerAuth);
app.use('/docs', routerDoc);
app.use('/events', routerEvent);
app.use('/surveys', routerSurvey);
app.use('/trade', routerTrade);
app.use("/users", routerUser);

//Port
app.listen(8080, () => {console.log('App listening on port 8080!!')});