//Importing packages
const mongoose = require('mongoose');

//Jackpot register schema
const jackpot = mongoose.Schema({
    ////Jackpot id
    jackpot_id: String,

    ////Jackpot entity
    jackpot_entity: String,

    ////Jackpot documentation
    jackpot_class: String,
    jackpot_title: String,
    jackpot_doc_intro: String,
    jackpot_doc_participate: String,
    jackpot_doc_score: String,
    jackpot_doc_rights: String,
    jackpot_doc_kick: String,

    ////Jackpot dates
    start: Date,
    end: Date,
    active: Boolean,

    ////Jackpot participants and winners
    total_value: String,
    winners: Array,
    users: Array

},{versionKey: false});
const Jackpot = mongoose.model('SteamJackpot', jackpot);
module.exports = Jackpot;



