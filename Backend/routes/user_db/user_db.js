//Importing packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;



//Gameplay register schema
var GameplayRegister = mongoose.Schema({
    appid: String,
    total_gameplay: Array,
    win_gameplay: Array,
    mac_gameplay: Array,
    lin_gameplay: Array,
    register_date: Date
});


//Recomendation register schema
var RecomendationRegister = mongoose.Schema({
    rec_date: Date,
    rec_userid: String
});


//Prize register schema
var PrizeRegister = mongoose.Schema({
    prize_id: String,
    prize_date: Date,
    prize_cash: String,
    prize_category: String
});


//Strike register schema
var StrikeRegister = mongoose.Schema({
   strike_date: Date,
   strike_total: String,
   strike_reason: String
});


//Ban register schema
var BanRegister = mongoose.Schema({
    ban_start: Date,
    ban_type: String,
    ban_reason: String,
    ban_end: Date,
    ban_condition: String
});


//Additional register schema
var AdditionalRegister = mongoose.Schema({
    event_id: String,
    user_event_start: Date,
    user_event_end: Date
});


//Basic user schema
var user = mongoose.Schema({
    ////Basic data
    userid : String,
    name : String,
    joined : Date,
    thumbnail: String,
    last_visibility: String,

    ////Score
    score: String,
    probability: String,

    ////Monitored games
    monitored: [GameplayRegister],

    ////Recomendations
    recomendations: [RecomendationRegister],

    ////Prizes
    prizes: [PrizeRegister],

    ////Strikes
    strikes: [StrikeRegister],

    ////Bans
    bans: [BanRegister],
    banned: Boolean,
    permanent_ban: Boolean,

    ////Additional
    additional: [AdditionalRegister]

});
var User = mongoose.model('SteamUser',user);
module.exports = User;