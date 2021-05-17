//Packages
const mongoose = require('mongoose');

const EventOffer = mongoose.Schema({
    offer_id: String,
    offer_user_id: String,
    offer_user_name: String,
    offer_user_thumbnail: String,
    offer_date: Date,
    offer_type_out: String,
    offer_value_out: String,
    offer_type_in: String,
    offer_value_in: String
});

const EventTitles = mongoose.Schema({
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
const event = mongoose.Schema({
    ////Id
    event_id: String,
    event_class: String,
    event_title: EventTitles,
    event_thumbnail: String,

    ////Who is running the event
    event_entity: String,

    ////Resume
    start: Date,
    final: Date,
    total_value: {type: Number},
    total_score: {type: Number},
    users: Array,
    multipliers: {type: Number},

    ////Status
    active: Boolean,
    users_timetable: Array,
    price_timetable: Array,
    wealth_distribution: Array,

    ////Top 10
    top_users: [TopUserRegister],

    ////Offers
    event_offers: [EventOffer],

    ////Data
    products: Array,
    data: Array

},{versionKey: false});
const Event = mongoose.model('Event', event);
module.exports = Event;



