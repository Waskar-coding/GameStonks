//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const Jackpot = require('../object_db/jackpot_db.js');
const Game = require('../object_db/game_db.js');
const User = require('../object_db/user_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');



//Getting jackpot list
router.get('/current',steamAuth.ensureAuthenticated, localAuth,function(req,res){
    ////Returning current jackpots
    const active = [];
    const participate = [];
    const registers = [];
    const current = Jackpot.find({active: true},function(err,jackpots){
       if(!err){
           for(let jackpot of jackpots){
               const jackpotJSON = {
                   jackpot: {
                       jackpot_id: jackpot.jackpot_id,
                       jackpot_title: jackpot.jackpot_title,
                       entity: jackpot.entity,
                       jackpot_class: jackpot.jackpot_class,
                       start: jackpot.start,
                       end: jackpot.end,
                       total_value: jackpot.total_value
                   }
               };
               active.push(jackpotJSON);
               if (jackpot.users.includes(req.user.user.steamid)){
                   participate.push(jackpot.jackpot_id);
               }
           }

           ////Checking user participation
           for (register of req.user.user.jackpots){
               if (participate.includes(register.jackpot_id)){
                   registers.push(register);
               }
           }

           ////Creating response json
           const userjackpotsJSON = {
               available:  active,
               registers: registers
           };
           res.send(userjackpotsJSON);
       }
    });
});



//Getting a jackpot
router.get('/:jackpot_id',steamAuth.ensureAuthenticated, localAuth,function(req,res){
    ////Retrieving jackpot information
    Jackpot.findOne({jackpot_id: req.params.jackpot_id},function(err,jackpot){
        if (err){
            console.log('error');
            res.redirect('./current');
        }
        else if(jackpot === null){
            console.log('error');
            res.redirect('./current');
        }
        else if(jackpot.active ===false){
            console.log('error');
            res.redirect('./current');
        }
        else{
            ////Retrieving jackpot features
            loadFeatures(jackpot.jackpot_class,function(features){
                ////Consulting player registers
                let player = 'NaN';
                for (register of req.user.user.jackpots){
                    if (register.jackpot_id === jackpot.jackpot_id){
                        player = register;
                        break;
                    }
                }

                ////Creating a new register if necessary
                if (player === 'NaN'){
                    player = {
                        jackpot_id: jackpot.jackpot_id,
                        date: today,
                        score: 0,
                        multipliers: [],
                        recommendations: 0,
                        status: 'i'
                    };
                    req.user.user.jackpots.push(player);
                    User.findOne({steamid: req.user.user.steamid},function(err,user){
                        const today = new Date();
                        user.jackpots.push(player);
                        user.save()
                    })
                }

                ////Response JSON
                const userjackpotJSON = {
                    jackpot: jackpot,
                    features: features,
                    register: player
                };
                res.send(userjackpotJSON);
            });
        }
    });
});



//Features first class function
function loadFeatures(jclass,callback){
    const jfunctions = {
        'J01': loadJ01
    };
    jfunctions[jclass](function(features){
        callback(features);
    });
}



//Class J01 loading function
function loadJ01(callback){
    ////Retrieving lauched g
    const launched = [];
    Game.find({current_state:"al"},function (err,games) {
        if (!err) {
            for (game of games) {
                const gameJSON = {
                    appid: game.appid,
                    name: game.name,
                    release: game.release.toString().substring(0, 10),
                    thumbnail: game.image_url
                };
                launched.push(gameJSON);
            }
            callback(launched);
        }
    });
}



//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;