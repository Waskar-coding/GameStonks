//Importing packages
const mongoose = require('mongoose');

//Jackpot register schema
const JackpotRegister = mongoose.Schema({
    jackpot_id: String,
    date: Date,
    score: {type: Number},
    share_timetable: Array,
    jackpot_timeline: Array,
    multipliers: Array,
    recommendations: Array,
    status: String
});

//Gameplay register schema
const GameplayRegister = mongoose.Schema({
    appid: String,
    name: String,
    total_gameplay: Array,
    register_date: Date
});


//Strike register schema
const StrikeRegister = mongoose.Schema({
    strike_date: Date,
    strike_type: String,
    ////Optional
    strike_data: Array
});

//Ban register schema
const BanRegister = mongoose.Schema({
    ban_start: Date,
    ban_type: String,
    ////Optional
    ban_end: Date,
    ban_data: Array
});

//Claim register schema
const ClaimRegister = mongoose.Schema({
   claim_date: Date,
   claim_type: String,
   claim_cash: {type: Number}
});


//Basic user schema
const user = mongoose.Schema({
    ////Steam data
    steamid: String,
    name: String,
    timecreated: String,
    thumbnail: String,
    profile_url: String,

    ////GameStonks basic data
    joined: Date,
    wealth: {type: Number},
    wealth_timetable: Array,
    banned: Boolean,
    multipliers: Array,
    loyalty: {type: Number},
    questions: {type: Number},

    ////Timeline
    general_timeline: Array,

    ////Jackpots
    jackpots: [JackpotRegister],

    ////Register of current data
    monitored: [GameplayRegister],
    claims: [ClaimRegister],
    strikes: [StrikeRegister],
    ban: BanRegister

},{versionKey: false});
const User = mongoose.model('SteamUser', user);
module.exports = User;
