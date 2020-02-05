//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');
const fs  = require('fs');

////Local
const Jackpot = require('../object_db/jackpot_db.js');
const Game = require('../object_db/game_db.js');
const User = require('../object_db/user_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');





//Current jackpots
////Current jackpots: main
router.get('/current',steamAuth.ensureAuthenticated, localAuth,function(req,res){
    ////Returning current jackpots
    const registers = [];
    Jackpot.find({active: true},function(err,jackpots){
       if(!err){
           const userJackpots = getJackpots(req,jackpots);

           ////Checking user participation
           for (register of req.user.user.jackpots){
               if (userJackpots[1].includes(register.jackpot_id)){
                   registers.push(register);
               }
           }

           ////Creating response json
           const userjackpotsJSON = {
               available:  userJackpots[0],
               registers: registers
           };
           res.send(userjackpotsJSON);
       }
    });
});


////Current jackpots: Active jackpots & user jackpots
function getJackpots(req,jackpots){
    const active = [];
    const participate = [];
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
    return [active,participate]
}



//Get a Jackpot
////Get a Jackpot: main
router.get('/:jackpot_id',steamAuth.ensureAuthenticated, localAuth,function(req,res){
    ////Retrieving jackpot information
    Jackpot.findOne({jackpot_id: req.params.jackpot_id},function(err,jackpot){
        if ((err) || (jackpot === null) || (jackpot.active === false)){
            console.log('error');
            res.redirect('./current');
        }
        else{
            ////Retrieving jackpot features
            loadFeatures(jackpot.jackpot_class,function(features){

                ////Response JSON
                const userjackpotJSON = {
                    jackpot: jackpot,
                    documentation: readDocs(jackpot),
                    features: features,
                    register: getRegister(req,jackpot)
                };
                res.send(userjackpotJSON);
            });
        }
    });
});


////Get a Jackpot: Features first class function
function loadFeatures(jclass,callback){
    const jfunctions = {
        'J01': loadJ01
    };
    jfunctions[jclass](function(features){
        callback(features);
    });
}


////Get a Jackpot: Class J01 loading function
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


////Get a Jackpot: Finding user jackpot register
function findRegister(req,jackpot){
    ////Consulting player registers
    let player = 'NaN';
    for (register of req.user.user.jackpots){
        if (register.jackpot_id === jackpot.jackpot_id){
            player = register;
            break;
        }
    }
    return player
}


////Get a Jackpot: Creating new jackpot register if no previous register is found
function newRegister(req,player,jackpot){
    if (player === 'NaN'){
        player = {
            jackpot_id: jackpot.jackpot_id,
            date: new Date(),
            score: 0,
            multipliers: [],
            recommendations: 0,
            status: 'i'
        };
        req.user.user.jackpots.push(player);
        User.findOne({steamid: req.user.user.steamid},function(err,user){
            user.jackpots.push(player);
            user.save();
            return player
        })
    }
    else { return player }
}


////Get a Jackpot: Getting jackpot register
function getRegister(req,jackpot){
    return newRegister(req,findRegister(req,jackpot),jackpot)
}


////Get a Jackpot: Read jackpot docs
function readDocs(jackpot){
    const jdocsJSON = {
        intro: fs.readFileSync( path.join(__dirname, '/Jackpot files/', jackpot.jackpot_doc_intro)).toString(),
        participate: fs.readFileSync(path.join(__dirname, '/Jackpot files/', jackpot.jackpot_doc_participate)).toString(),
        score: fs.readFileSync(path.join(__dirname, '/Jackpot files/', jackpot.jackpot_doc_score)).toString(),
        rights: fs.readFileSync( path.join(__dirname, '/Jackpot files/', jackpot.jackpot_doc_rights)).toString(),
        kick: fs.readFileSync(path.join(__dirname, '/Jackpot files/',jackpot.jackpot_doc_kick)).toString()
    };
    return jdocsJSON;
}



//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;