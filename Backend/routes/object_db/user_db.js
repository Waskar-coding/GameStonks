//Importing packages
const mongoose = require('mongoose');

//Jackpot register schema
const JackpotRegister = mongoose.Schema({
    jackpot_id: String,
    date: Date,
    score: String,
    multipliers: Array,
    recommendations: String,
    status: String
});

//Gameplay register schema
const GameplayRegister = mongoose.Schema({
    appid: String,
    active: Boolean,
    total_gameplay: Array,
    win_gameplay: Array,
    mac_gameplay: Array,
    lin_gameplay: Array,
    register_date: Date
});

//Recomendation register schema
const RecomendationRegister = mongoose.Schema({
    rec_date: Date,
    rec_userid: String
});

//Prize register schema
const PrizeRegister = mongoose.Schema({
    prize_id: String,
    prize_date: Date,
    prize_cash: String,
    prize_category: String
});

//Strike register schema
const StrikeRegister = mongoose.Schema({
    strike_date: Date,
    strike_total: String,
    strike_reason: String
});

//Ban register schema
const BanRegister = mongoose.Schema({
    ban_start: Date,
    ban_type: String,
    ban_active: Boolean,
    ban_end: Date,
    ban_doc: String
});

//Additional register schema
const AdditionalRegister = mongoose.Schema({
    event_id: String,
    user_event_start: Date,
    user_event_end: Date,
    user_multiplier: Boolean
});

//Basic user schema
const user = mongoose.Schema({
    ////Basic data
    steamid: String,
    name: String,
    joined: Date,
    timecreated: String,
    thumbnail: String,

    ////Jackpots
    jackpots: [JackpotRegister],

    ////Monitored games
    monitored: [GameplayRegister],

    ////Recomendations
    recomendations: [RecomendationRegister],

    ////Prizes
    prizes: [PrizeRegister],

    ////Strikes
    strikes: [StrikeRegister],
    current_strikes: String,

    ////Bans
    bans: [BanRegister],
    banned: Boolean,

    ////Additional
    additional: [AdditionalRegister]

},{versionKey: false});
const User = mongoose.model('SteamUser', user);
module.exports = User;
