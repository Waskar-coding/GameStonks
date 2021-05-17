//Packages
const mongoose = require('mongoose');

//Trade register schema
const TradeRegister = mongoose.Schema({
    offer_id: String,
    offer_user_id: String,
    offer_user_name: String,
    offer_user_thumbnail: String,
    offer_date: Date,
    offer_type_in: String,
    offer_value_in: String,
    offer_type_out: String,
    offer_value_out: String
});

//Event register schema
const EventRegister = mongoose.Schema({
    event_id: String,
    date: Date,
    score: {type: Number},
    share_timetable: Array,
    event_timeline: Array,
    multipliers: Array,
    handshakes: Array,
    status: String,
    products: Array,
    offer: Object
});

//Product register schema
const ProductRegister = mongoose.Schema({
    product_id: String,
    register_date: Date,
    register_type: String,
    register_data: Object
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
const RequestRegister = mongoose.Schema({
   request_date: Date,
   request_type: String,
   request_cash: {type: Number}
});

//Basic user schema
const user = mongoose.Schema({
    ////Steam data
    steamid: String,
    name: String,
    timecreated: {type: Number},
    thumbnail: String,
    profile_url: String,

    ////GameStonks basic data
    joined: Date,
    wealth: {type: Number},
    wealth_timetable: Array,
    banned: Boolean,
    multipliers: Array,
    loyalty: {type: Number},
    survey_number: {type: Number},
    surveys: Array,
    survey_rewards: Array,
    survey_date: Date,

    ////Timeline
    general_timeline: Array,

    ////Events
    events: [EventRegister],

    ////Trade
    my_offers: [TradeRegister],
    user_offers: [TradeRegister],

    ////Register of current data
    monitored: [ProductRegister],
    requests: [RequestRegister],
    strikes: [StrikeRegister],
    ban: BanRegister

},{versionKey: false});
const User = mongoose.model('User', user);
module.exports = User;
