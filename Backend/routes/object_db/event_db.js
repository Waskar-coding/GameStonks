//Importing packages
const mongoose = require('mongoose');

//Jackpot register schema
const event = mongoose.Schema({
    ////Event id and documentation
    event_id: String,
    event_entity: String,
    event_title: String,
    event_doc: String,

    ////Event dates
    event_start: Date,
    event_end: Date,
    active: Boolean

},{versionKey: false});
const Event = mongoose.model('SteamEvent', event);
module.exports = Event;