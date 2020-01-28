const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const game = mongoose.Schema({
    appid: String,
    name: String,
    release: Date,
    score: String,
    image: String,
    priority: Boolean
});
const Game = mongoose.model('SteamGame', game);
module.exports = Game;
