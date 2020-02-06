const mongoose = require('mongoose');
const app = mongoose.Schema({
    appid: String,
    name: String,
    release: Date,
    score: String
});
const Game = mongoose.model('SteamApp', app);
module.exports = Game;
