const mongoose = require('mongoose');

const EventRegister = mongoose.Schema({
    event_id: String,
    event_class: String,
    event_data: Array
});

const game = mongoose.Schema({
    appid: String,
    name: String,
    release: Date,
    thumbnail: String,
    current_events: Array,
    registers: [EventRegister],
    players: Array,
    base_value: {type: Number}
});

const Game = mongoose.model('SteamGame', game);
module.exports = Game;
