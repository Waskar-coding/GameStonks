//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const User = require('../object_db/user_db.js');
const Game = require('../object_db/game_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');
const JackpotGet = require('./jackpot_get');
banUser = JackpotGet.banUser;
strikeUser = JackpotGet.strikeUser;



//Dropping games
router.post('/drop',function(req,res){
    if(req.body.status){
        res.redirect('./assertdrop')
    }
    else{
        dropGame(req,function(){
            res.send({message: 'Game successfully dropped'})
        })
    }
});

router.post('/assertdrop',function(req,res){
   if(req.body.assert){
       dropGame(req,function(){

       })
   }
   else{
       res.send({message: 'Game drop was cancelled'})
   }
});


////Dropping games: Generate strike resgister
function genStrike(req,callback){
    console.log('Generating strike');
    User.findOne({"steamid": req.user.user.steamid},function(err,user){
        const register = {
            strike_date: new Date(),
            strike_total: Number(user.current_strikes) + 1,
            strike_reason: "You dropped a game while the site was collecting information"
        };
        const strikes = Number(user.current_strikes) + 1;
        callback( [register,strikes] );
    });
}


////Dropping games: Drop function
function dropGame(req,callback){
    Game.findOneAndUpdate(
        {"appid": req.body.appid},
        {$pull: {"players": req.user.user.steamid}}
        );
    User.findOneAndUpdate(
        {"steamid": req.user.user.steamid, "monitored.appid": req.body.appid},
        {$pull: {"monitored.$.appid": req.body.appid}}
    );
    callback()
}




//Getting getting user account data
router.get('/my_profile/',steamAuth.ensureAuthenticated, localAuth.verifyToken,function(req, res){
    User.findOne({steamid: req.user.user.steamid}).lean().exec(function(err,user){
        if (!err){
            getActive(user.monitored,function(monitored){
                const userJSON = {
                    steamid: user.steamid,
                    name: user.name,
                    joined: user.joined.toISOString().substring(0, 10),
                    thumbnail: user.thumbnail,
                    prizes: user.prizes,
                    banned: user.banned,
                    current_strikes: user.current_strikes,
                    jackpots: user.jackpots,
                    monitored: monitored,
                    recommendations: user.recommendations,
                    strikes: user.strikes,
                    bans: user.bans,
                    events: user.additional
                };
                res.send(userJSON);
            })
        }
    })
});


////My profile: Searching for active games
function getActive(monitored,callback){
    for(let i=0; i<monitored.length; i++){
        Game.findOne({appid: monitored[i].appid},function(err,game){
            if(!err){
                if(game.current_status === 'i'){
                    monitored[i] = Object.assign(monitored[i], {status:'i'});
                }
                else{
                    monitored[i] = Object.assign(monitored[i], {status:'a'});
                    console.log(monitored);
                }
            }
            else{
                console.log(err);
            }

            if(i === monitored.length -1){
                callback(monitored)
            }
        });
    }
    if(monitored.length === 0){
        callback([])
    }
}



//Getting other users data
router.get('/:steamid',function(req, res){
    User.findOne({steamid: req.params.steamid},function (err, user) {
        if((!err) && (user != null)){
            const userJSON = {
                steamuser: {
                    steamid: user.steamid,
                    name: user.name,
                    joined: user.joined.toISOString().substring(0, 10),
                    thumbnail: user.thumbnail,
                    prizes: user.prizes,
                    banned: user.banned
                }
            };
            res.send(userJSON)
        }
        else{
            res.status(404).send({message: "User not found"})
        }
    })
});



//Finding user by name
router.get('/find_user/:username', function(req, res){
    const userList = [];
    User.find({name: {"$regex": req.params.username, $options: 'i'}},function (err, users) {
        if(!err){
            for (const user of users) {
                const userJSON = {
                    steamuser: {
                        name: user.name,
                        thumbnail: user.thumbnail,
                    }
                };
                userList.push(userJSON)
            }
            res.send(userList)
        }
        console.log(userList);
    })
});



//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
