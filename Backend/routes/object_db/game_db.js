const mongoose = require('mongoose');
const game = mongoose.Schema({
    appid: String,
    name: String,
    release: Date,
    score: String,
    image_url: String,
    current_state: String
});
const Game = mongoose.model('SteamGame', game);
module.exports = Game;
