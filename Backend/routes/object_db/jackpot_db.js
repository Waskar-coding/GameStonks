//Importing packages
const mongoose = require('mongoose');

//Jackpot register schema
const jackpot = mongoose.Schema({

    ////Id
    jackpot_id: String,
    jackpot_class: String,
    jackpot_title: String,

    ////Who is running the jackpot
    jackpot_entity: String,

    ////Resume
    start: Date,
    end: Date,
    total_value: {type: Number},
    total_score: {type: Number},
    users: Array,
    has_multipliers: String,
    max_multipliers: {type: Number},

    ////Status
    active: Boolean,
    winners: Array,

    ////Plots
    users_timetable: Array,
    price_timetable: Array,
    wealth_distribution: Array,

    ////Top 10
    top_users: Array

},{versionKey: false});
const Jackpot = mongoose.model('SteamJackpot', jackpot);
module.exports = Jackpot;



