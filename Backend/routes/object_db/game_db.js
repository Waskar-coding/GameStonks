var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var game = mongoose.Schema({
    appid : String,
    name : String,
    release : Date,
    score : String,
    image: String,
    priority: Boolean
});
var Game = mongoose.model('SteamGame',game);
module.exports = Game;