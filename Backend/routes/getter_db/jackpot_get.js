//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');
const fs  = require('fs');
const request = require('request');

////Local
const Jackpot = require('../object_db/jackpot_db.js');
const Game = require('../object_db/game_db.js');
const User = require('../object_db/user_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');
const APIKEY = process.env.STEAM_PERSONAL_APIKEY;



//Multipliers
router.post('/multiply',function(req,res){
    User.findOne({steamid: req.body.steamid}, function(err, user){
        if(err){
            res.send({message: 'There was an error and your multiplier was not applied'})
        }
        else if(user.multipliers.length === 0){
            res.send({message: "Multiplier not found"})
        }
        else{
            for(let i = 0; i<user.multipliers.length; i++){
                console.log(user.multipliers[i]);
               if(user.multipliers[i] === req.body.multiplier){
                   user.multipliers.splice(i,1);
                   if(user.jackpots.length === 0){
                       res.send({message: `Jackpot not found, could not use multiplier`})
                   }
                   for(let j = 0; j<user.jackpots.length; j++){
                       if(user.jackpots[j].jackpot_id === req.body.jackpot_id){
                           user.jackpots[j].multipliers.push(req.body.multiplier);
                           user.jackpots[j].score = firstClassEvents(req.body.multiplier, user.jackpots[j].score);
                           user.markModified('multipliers');
                           user.markModified('jackpots');
                           user.save().then(() => {
                               res.send(
                                   {message: `A ${req.body.multiplier} multiplier has been applied to the jackpot ${req.body.jackpot_id}`}
                                   )
                           });
                           break;
                       }
                       else if((j === user.jackpots.length - 1)
                           && (user.jackpots[j].jackpot_id !== req.body.jackpod_id)){
                           res.send({message: `Jackpot not found, could not use multiplier`});
                       }
                   }
                   break;
               }
               else if((i === user.multipliers.length - 1) && (user.multipliers[i] !== req.body.multiplier)){
                   res.send({message: `Multiplier not found`});
               }
            }
        }
    })
});

function firstClassEvents(event_class, score){
    event_dict = {
        'E01': modifyE01
    };
    return event_dict[event_class](score);
}

function modifyE01(score){
    return 1.5*score;
}



//Game call
router.post('/call_game', function(req,res){
    const features_dict = {
        J01: ["al", "s"]
    };
    Game.find({current_state: {$in: features_dict[req.body.jackpot_class]}},function(err,games){
       let inDB = false;
       for(let game of games){
           if (req.body.appid === game.appid) {
               inDB = true;
               requestOwned(req,function(steam_response){
                   if(steam_response[0] === 0){
                       createGameplay(req,steam_response[1],res);
                   }
                   else if(steam_response[0] === 1){
                       strikeUser(req,generateStrikeCall,handleStrikeCall,res);
                   }
                   else{
                       banUser(req,res);
                   }
               })
           }
       }
       if(!inDB){
           res.status(404).send({message: "Game not found in jackpot features"})
       }
    });
});


////Game call: Building steam API url
function buildURL(steamid){
    const STEAMAPI_BASE =  "http://api.steampowered.com";
    const STEAMAPI_ENV = "/IPlayerService";
    const STEAMAPI_FUNC = "/GetOwnedGames";
    const STEAMAPI_VERSION = "/v0001";
    const steam_params = {
        key: APIKEY,
        steamid: steamid,
        include_played_free_games: true,
        format: 'json'
    };
    let url = STEAMAPI_BASE + STEAMAPI_ENV + STEAMAPI_FUNC + STEAMAPI_VERSION +'/?';
    for (const key in steam_params){
        url = url + key + '=' + steam_params[key] + '&'
    }
    return url.slice(0,-1)
}


////Game call: Making request to steam API
function requestOwned(req,callback){
    let status = 1;
    let playtime = 0;
    request(buildURL(req.body.steamid),{json: true}, (err,steam_res) => {
        if((steam_res.statusCode === 200) && (steam_res.body.response.games !== undefined)){
            for(game of steam_res.body.response.games){
                if(game.appid == req.body.appid){
                    status = 0;
                    playtime = game.playtime_forever;
                    break;
                }
            }
        }
        else{
            status = 2;
        }
        callback([status,playtime])
    });

}


////Game call: Creating a game register
function createGameplay(req,playtime,res){
    register = {
        appid: req.body.appid,
        active: true,
        total_gameplay: [],
        win_gameplay: [],
        mac_gameplay: [],
        lin_gameplay: [],
        register_date: new Date()
    };
    User.findOne({steamid: req.body.steamid},function(err,user){
        if(!err){
            checkRepeated(req,user,function(rep_flag){
                if(!rep_flag){
                    User.findOneAndUpdate({"steamid": req.body.steamid},{$push: {monitored: register}},function(err,user){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log("Game registered for user")
                        }
                    });
                    Game.findOneAndUpdate({appid: req.body.appid},{$push: {players: req.body.steamid}},function(err,game){
                        if(!err){
                            for(let jackpot of user.jackpots){
                                if((jackpot.jackpot_id === req.body.jackpot_id) && (jackpot.status !== 'k')){
                                    const new_score = Number(jackpot.score) + getScore(req,game,user,jackpot,playtime);
                                    console.log(new_score);
                                    User.findOneAndUpdate(
                                        {"steamid": req.body.steamid,"jackpots.jackpot_id": jackpot.jackpot_id},
                                        {"$set": {"jackpots.$.status":  "a", "jackpots.$.score": new_score.toString()}},
                                        function(err,user){
                                            if(err){
                                                console.log(err);
                                            }
                                            else{
                                                res.send(
                                                    {
                                                        score: new_score,
                                                        message: "Jackpot state set to active, score modified"
                                                    }
                                                )
                                            }
                                        }
                                    );
                                }
                                else if(jackpot.jackpot_id === req.body.jackpot_id){
                                    console.log('You were kicked from this jackpot');
                                    res.redirect('./current');
                                }
                            }
                        }
                    })
                }
                else{
                    res.send({mesage: "You have already registered this game"})
                }
            })
        }
    })
}


////Game call: Checking if games is already in registers
function checkRepeated(req,user,callback){
    let rep_flag = false;
    for(let register of user.monitored){
        if(register.appid === req.body.appid){
            rep_flag = true;
            break;
        }
    }
    callback(rep_flag)
}


//Gamme call: Score first class function
function getScore(req,game,user,jackpot,playtime){
    ScoreDict = {
        'J01': scoreJ01
    };
    return ScoreDict[req.body.jackpot_class](game,user,jackpot,playtime);
}


//Game call: Score J01 class function
function scoreJ01(game,user,jackpot,playtime){
    return Number(game.score) * Math.pow(game.players.length+1,-0.25) * Math.pow(Math.E,-playtime/120);
}


////Game call: Banning user
function banUser(req,res){
    console.log('Banning user');
    const today = new Date();
    const register = {
        ban_start: new Date(),
        ban_type: 'B02',
        ban_active: true,
        ban_end: today.setTime( today.getTime() + 60 * 86400000 ),
        ban_doc: 'B02.txt'
    };
    User.findOneAndUpdate(
        {"steamid": req.body.steamid, "jackpots.jackpot_id": req.body.jackpot_id},
        {$set: {"current_strikes": 0, "banned": true, "jackpots.$.status": 'k'}, $push: {"bans": register}},
        function(err,user){
            if(err){
                console.log(err);
                res.redirect("/logout")
            }
            else{res.redirect("/logout")}
    })
}


////Game call: Striking user
function strikeUser(req,generateStrike,handleStrike,res){
    console.log("Striking user");
    generateStrike(req,function(strike_tuple){
        User.findOneAndUpdate(
            {"steamid": req.body.steamid, "jackpots.jackpot_id": req.body.jackpot_id},
            {$push: {"strikes": strike_tuple[0]}, $set: {current_strikes: strike_tuple[1],"jackpots.$.status": 'k'}},
            function(err,user){
                if(err) {
                    console.log(err);
                    res.redirect('./current');
                }
                else if(user.current_strikes >= 2) {
                    banUser(req, res);
                }
                else{
                    console.log('Returning to current');
                    handleStrike(req,res);
                }
            })
    });
}


////Game call: Handle strike
function handleStrikeCall(req,res){
    res.redirect('./current');
}


////Game call: Generate strike resgister
function generateStrikeCall(req,callback){
    console.log('Generating strike');
    User.findOne({"steamid": req.body.steamid},function(err,user){
        const register = {
            strike_date: new Date(),
            strike_total: Number(user.current_strikes) + 1,
            strike_reason: "You declared in a J01 jackpot that you owned games that you did not have at the time"
        };
        const strikes = Number(user.current_strikes) + 1;
        callback( [register,strikes] );
    });
}



//Current jackpots
////Current jackpots: main
router.get('/current',steamAuth.ensureAuthenticated, localAuth.verifyToken,function(req,res){
    ////Returning current jackpots
    const registers = [];
    Jackpot.find({active: true},function(err,jackpots){
       if(!err){
           const userJackpots = getJackpots(req,jackpots);

           ////Checking user participation
           User.findOne({steamid: req.user.user.steamid},function(err,user){
               if(!err) {
                   for (register of user.jackpots) {
                       if (userJackpots[1].includes(register.jackpot_id)) {
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
router.get('/:jackpot_id',steamAuth.ensureAuthenticated, localAuth.verifyToken,localAuth.verifyJackpot, function(req,res){
    ////Retrieving jackpot information
    Jackpot.findOne({jackpot_id: req.params.jackpot_id},function(err,jackpot){
        if ((err) || (jackpot === null) || (jackpot.active === false)){
            console.log('error');
            res.redirect('./current')
        }
        else{
            ////Retrieving jackpot features
            loadFeatures(jackpot.jackpot_class,function(features){
                getRegister(req,jackpot,function(reg_list){
                    readDocs(jackpot,function(docs){
                        console.log('Docs obtained');
                        res.send({
                            jackpot: jackpot,
                            documentation: docs,
                            features: features,
                            register: reg_list[0],
                            games: reg_list[1]
                        });
                    })
                });
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
    ////Retrieving lauched games
    const launched = [];
    Game.find({current_state:{$in:["al","s"]}}, function(err, games){
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
function findRegister(req, jackpot,callback){
    ////Consulting player registers
    let player = 'NaN';
    const games = [];
    User.findOne({steamid: req.user.user.steamid},function(err,user){
        for(let register of user.jackpots){
            if (register.jackpot_id === jackpot.jackpot_id){
                player = register;
                console.log('Already in register');
                break;
            }
        }
        for(let game of user.monitored){
            games.push(game.appid);
        }
        callback( [player, games] )
    });
}


////Get a Jackpot: Creating new jackpot register if no previous register is found
function newRegister(req,player,jackpot,callback){
    console.log(player);
    if (player === 'NaN'){
        console.log('Creating new register');
        player = {
            jackpot_id: jackpot.jackpot_id,
            date: new Date(),
            score: 0,
            multipliers: [],
            recommendations: [],
            status: 'i'
        };
        Jackpot.findOneAndUpdate({jackpot_id: jackpot.jackpot_id}, {$push: {users: req.user.user.steamid}},function(err,update){
            if(err){
                console.log(err);
            }
            else{
                console.log(update.jackpot_id);
                console.log(update.users);
            }
        });
        User.findOneAndUpdate({steamid: req.user.user.steamid},{$push: {jackpots: player}},function(err,update){
            if (err){
                console.log(err);
                res.redirect('./current');
            }
            else{
                console.log("Updated user");
                callback(player)
            }
        })
    }
    else { callback(player) }
}


////Get a Jackpot: Getting jackpot register
function getRegister(req,jackpot,callback) {
    findRegister(req, jackpot, function (reg_list) {
        newRegister(req, reg_list[0], jackpot, function (player){
            reg_list[0] = player;
            callback( reg_list )
        });
    });
}


////Get a Jackpot: Read jackpot docs
function readDocs(jackpot,callback){
    callback( {
        intro: fs.readFileSync( path.join(__dirname, '/Jackpot files/', jackpot.jackpot_doc_intro)).toString(),
        participate: fs.readFileSync(path.join(__dirname, '/Jackpot files/', jackpot.jackpot_doc_participate)).toString(),
        score: fs.readFileSync(path.join(__dirname, '/Jackpot files/', jackpot.jackpot_doc_score)).toString(),
        rights: fs.readFileSync( path.join(__dirname, '/Jackpot files/', jackpot.jackpot_doc_rights)).toString(),
        kick: fs.readFileSync(path.join(__dirname, '/Jackpot files/',jackpot.jackpot_doc_kick)).toString()
    } )
}


//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;