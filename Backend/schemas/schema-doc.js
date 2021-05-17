//Packages
const mongoose = require('mongoose');

const Text = mongoose.Schema({ES: String, EN: String});

//Jackpot register schema
const doc = mongoose.Schema({
    doc_title: {type: Text, required: true},
    doc_type: {type: String, required: true},
    doc_updated: {type: Date, required: true},
    doc_sequence: {type: Array, required: true},
    doc_article_resume: {type: Text, required: false},
    doc_article_thumbnail: {type: String, required: false}
},{versionKey: false});
const Doc = mongoose.model('Doc', doc);
module.exports = Doc;
