//Importing packages
const mongoose = require('mongoose');


//Question register schema
const QuestionRegister = mongoose.Schema({
    question: String,
    options: Array,
    answers: Array,
    users: Array
},{versionKey: false});


//Event schema
const event = mongoose.Schema({
    ////Event id and documentation
    event_id: String,
    event_entity: String,
    event_title: String,
    event_class: String,
    event_doc: String,

    ////Event dates
    event_start: Date,
    event_end: Date,
    active: Boolean,

    ////Questions
    questions: [QuestionRegister],

    ////Awarded users
    awarded: Array

},{versionKey: false});
const Event = mongoose.model('SteamEvent', event);
module.exports = Event;