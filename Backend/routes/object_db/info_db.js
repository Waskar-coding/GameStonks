//Importing packages
const mongoose = require('mongoose');

const info = mongoose.Schema({
    text_id: String,
    language: String,
    tags: Array,
    description: String

},{versionKey: false});

const Info = mongoose.model('infotext', info);
module.exports = Info;