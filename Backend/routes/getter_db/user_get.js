//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const User = require('../object_db/user_db.js');
const Game = require('../object_db/game_db.js');
const Jackpot = require('../object_db/jackpot_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');

//Getting getting user account data
router.get('/profiles/my_profile',steamAuth.ensureAuthenticated, localAuth.verifyToken,function(req, res){
    User.findOne({steamid: req.user.user.steamid})
        .then(user => {
            res.send({
                steamid: user.steamid,
                name: user.name,
                joined: user.joined.toISOString().substring(0, 10),
                thumbnail: user.thumbnail,
                profile_url: user.profile_url,
                wealth: user.wealth,
                claims: user.claims,
                jackpots:  user.jackpots.filter(jackpot => {return jackpot.status === 'a'})
                    .map(jackpot => {return jackpot.jackpot_id}),
                jackpot_number: user.jackpots.length,
                question_number: user.questions,
                multipliers: user.multipliers,
                strikes: user.strikes
            });
        })
        .catch(err => {
            res.send({Error: "Internal server error"})
        })
});


//Getting other users data
router.get('/top/:steamid',function(req,res){
   User.findOne({steamid: req.params.steamid})
       .then(user => {res.send({name: user.name, thumbnail: user.thumbnail})})
       .catch(err => {res.status(500).send({Error: "Internal server error"})})
});

router.get('/profiles/:name',function(req,res){
   User.findOne({name: req.params.name})
       .then(user => {
           res.send({
               steamid: user.steamid,
               thumbnail: user.thumbnail,
               profile_url: user.profile_url,
               name: user.name,
               joined: user.joined,
               wealth: user.wealth,
               current_strikes: user.current_strikes,
               jackpots: user.jackpots.filter(jackpot => {return jackpot.jackpot_id}),
               questions: user.questions.length,
               multipliers: user.multipliers,
               strikes: user.strikes,
               bans: user.bans
           })
       })
       .catch(err => res.send({Error: "Internal server error"}))
});

//Getting handshakes
router.post('/handshakes',function(req, res){
    User.find({name: {$in: req.body.recommendations}})
        .then(users => {
            const handshakes = new Promise(resolve => {
                const handshakeList = users.map(user => {
                    return {thumbnail: user.thumbnail, name: user.name}
                });
                resolve(handshakeList)
            });
            handshakes.then(handshakeList => {
                res.send({recommendations: handshakeList})
            })
        })
        .catch(err => {
            res.status(500).send({Error: "Internal server error"})
        })
});



//Finding user by name
router.get('/find', function(req, res){
    const usersPerPage = 2;
    User.find({name: {"$regex": req.query.search, $options: 'i'}})
        .collation({locale: "en"})
        .sort({[req.query.sort]: req.query.order})
        .limit(usersPerPage)
        .skip((req.query.page-1)*usersPerPage)
        .then(users => {
            User.count({name: {"$regex": req.query.search, $options: 'i'}})
                .then(count => {
                    const userList = users.map(user => {
                        return {name: user.name, thumbnail: user.thumbnail, joined: user.joined}
                    });
                    if(req.user){
                        res.send({count: count, profiles: userList, my_name: req.user.user.name});
                    }
                    else{
                        res.send({count: count, profiles: userList, my_name: undefined})
                    }
                })
        })
        .catch(err => {
            res.status(500).send({Error: "Internal server error"})
        })

});



//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
