var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var app = mongoose.Schema({
    appid : String,
    name : String,
    release : Date,
    score : String
});
var Game = mongoose.model('SteamApp',app);
module.exports = Game;