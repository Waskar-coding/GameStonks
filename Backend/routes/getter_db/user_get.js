//Libraries
////Packages
const express = require('express');
const router = express.Router();
const request = require('request');
const path = require('path');

////Local
const User = require('../object_db/user_db.js');



//Getting getting user account data
router.get('/GetUserPrivate/:userid',function(req, res){
    User.findOne({userid: req.params.userid},function (err, user) {
        if(!err){
            const userJSON = {
                steamuser: {
                    userid: user.userid,
                    name: user.name,
                    joined: user.joined.toISOString().substring(0, 10),
                    thumbnail: user.thumbnail.split("'")[1],
                    jackpots: user.jackpots,
                    monitored: user.monitored,
                    recomendations: user.recomendations,
                    prizes: user.prizes,
                    strikes: user.strikes,
                    current_strikes: user.current_strikes,
                    bans: user.bans,
                    banned: user.banned,
                    additional: user.additional
                }
            };
            console.log(user);
            res.send(userJSON)
        }
    })
});



//Getting other users data
router.get('/GetUserPublic/:userid',function(req, res){
    User.findOne({userid: req.params.userid},function (err, user) {
        if(!err){
            const userJSON = {
                steamuser: {
                    userid: user.userid,
                    name: user.name,
                    joined: user.joined.toISOString().substring(0, 10),
                    thumbnail: user.thumbnail.split("'")[1],
                    prizes: user.prizes,
                    banned: user.banned
                }
            };
            console.log(user);
            res.send(userJSON)
        }
    })
});



router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
