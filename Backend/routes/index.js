//Imports
////Packages
var express = require('express');
var bodyParser = require( 'body-parser' );
var request = require('request');
var mongoose = require('mongoose');
var cors = require('cors');

////Local
var game = require('./object_db/game_db');
var gameGet = require('./getter_db/game_get')



//Initializing stuff
////Express
var app = express();
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
mongoose.connect("mongodb://localhost:27017/SteamDB", function (err) {
    if (!err) {
        console.log("We are connected")
    }
});


////Game API
app.use("/games",gameGet);
app.listen(80, function () {
    console.log('App listening on port 80!!')
});