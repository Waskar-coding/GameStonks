//Importing packages
const mongoose = require('mongoose');

const JackpotTitles = mongoose.Schema({
   ES: String,
   EN: String
},{typeKey: "$type"});

const TopUserRegister = mongoose.Schema({
    userId: String,
    name: String,
    thumbnail: String,
    share: {type: Number}
});

//Jackpot register schema
const jackpot = mongoose.Schema({

    ////Id
    jackpot_id: String,
    jackpot_class: String,
    jackpot_title: JackpotTitles,
    jackpot_thumbnail: String,

    ////Who is running the jackpot
    jackpot_entity: String,

    ////Resume
    start: Date,
    final: Date,
    total_value: {type: Number},
    total_score: {type: Number},
    users: Array,
    multipliers: {type: Number},

    ////Status
    active: Boolean,
    winners: Array,

    ////Plots
    users_timetable: Array,
    price_timetable: Array,
    wealth_distribution: Array,

    ////Top 10
    top_users: [TopUserRegister],

    ////Data
    data: Array

},{versionKey: false});
const Jackpot = mongoose.model('SteamJackpot', jackpot);
module.exports = Jackpot;



