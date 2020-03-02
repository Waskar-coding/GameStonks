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



//Recommendation
router.post('/recommend',function(req,res){
    User.findOne({steamid: req.body.my_steamid},function(err,user){
        if(!err){
            if(user.recommended){
                res.send({message: "You have already used your recommendation"})
            }
            else{
                getActiveJackpots(user.jackpots,function(jackpots){
                    shareJackpots(req.body.my_steamid, req.body.friend_steamid, jackpots, function(hasRec){
                        console.log(hasRec);
                        if(hasRec === true){
                            User.findOneAndUpdate({steamid: req.body.my_steamid}, {$set:{recommended: true}},function(err){
                                if(err){
                                    console.log(`Recommended for user ${req.body.my_steamid} should be set to true`);
                                }
                                else{
                                    res.send({message: 'Recommendation was correctly sent'});
                                }
                            })
                        }
                        else{
                            res.send({message: hasRec});
                        }
                    });
                });
            }
        }
        else{
            console.log(err);
        }
    })
});


function shareJackpots(my_id, friend_id, my_jackpots,callback){
    User.findOne({steamid: friend_id},function(err,friend){
      if((err) || (friend == null)){
          callback('User does not exits');
      }
      else if(friend.banned){
          callback('User is banned');
      }
      else{
          const f_jackpots = friend.jackpots;
          new Promise((resolve, reject) => {
              const my_data = [];
              for(let my_jackpot of my_jackpots){
                  if((my_jackpot.status === 'a') && (my_jackpot.active === true)){
                      my_data.push({
                          ID: my_jackpot.jackpot_id,
                          score: my_jackpot.score,
                          common: false
                      });
                  }
              }
              resolve([my_data, f_jackpots, friend_id, my_id]);
          }).then(common_array => {
              const active_array = common_array[0];
              const friend_jackpots = common_array[1];
              const f_id = common_array[2];
              for(let friend_jackpot of friend_jackpots){
                  for(let i = 0; i<active_array.length; i++){
                      if((friend_jackpot.jackpot_id === active_array[i].ID) && (friend_jackpot.status !== 'k')){
                          User.findOneAndUpdate({"steamid": friend_id, "jackpots.jackpot_id": friend_jackpot.jackpot_id},
                              {$set: {"jackpots.$.status": 'a', "jackpots.$.score": Number(friend_jackpot.score) + Number(active_array[i].score)},
                                  $push:{"jackpots.$.recommendations": my_id}},function(err,updated){
                                  if((err) || (updated === null)){
                                      console.log(err);
                                  }
                                  else{
                                      console.log(updated.jackpots[0].status);
                                      console.log('Register successfully updated');
                                  }
                              });
                          active_array[i].common = true;
                          break;
                      }
                  }
              }
              return [active_array, f_id, my_id]
          }).then(common_array => {
              const active_array = common_array[0];
              const f_id = common_array[1];
              for(let jackpot of active_array){
                  if(!jackpot.common){
                      const jackpot_register = {
                          jackpot_id: jackpot.ID,
                          date: new Date(),
                          score: jackpot.score,
                          multipliers: [],
                          recommendations: [my_id],
                          status: 'a'
                      };
                      User.findOneAndUpdate({steamid: f_id},{$push:{jackpots: jackpot_register}},function(err,update){
                          if(err){
                              console.log(err);
                          }
                          else{
                              console.log('New jackpot updated');
                          }
                      });
                      Jackpot.findOneAndUpdate({jackpot_id: jackpot.ID},{$push: {users: f_id}},function(err,update){
                          if(err){
                              console.log(err);
                          }
                          else{
                              console.log('Friend added to jackpot users');
                          }
                      })
                  }
              }
              return [f_id, my_id];
          }).catch(err => {
              console.log(err);
              console.log('Rejected');
              callback('There was an error with the recommendation and it could not be sent');
          }).then(steamid_array => {
              const rec_register = {
                  rec_date: new Date(),
                  rec_userid: steamid_array[1]
              };
              User.findOneAndUpdate({steamid: steamid_array[0]},{$push: {recomendations: rec_register}},function(err){
                  if(err){
                      console.log(f_id);
                      console.log(my_id);
                      console.log(err);
                  }
              });
              callback(true)
          });
      }
    })
}



//Dropping games
router.post('/drop',function(req,res){
    Game.findOne({appid: req.body.appid},function(err,game){
        if((err) || (game === null)){
            res.send({message: 'Game not found'})
        }
        else if(game.current_state !== 'i'){
            res.send({message: 'Redirecting to assert drop'})
        }
        else{
            dropGame(req,function(){
                res.send({message: 'Game successfully dropped'})
            })
        }
    })

});


//Asserting drop
router.post('/assertdrop',function(req,res){
    console.log(`Assert: ${req.body.assert}`);
    console.log(req.body.assert === true);
    console.log(req.body.assert === 'true');
    if(req.body.assert === 'true'){
       dropGame(req,function(){
           strikeUser(req,generateStrikeDrop,handleStrikeDrop,res);
       });
   }
   else{
       res.send({message: 'Game drop was cancelled'})
   }
});


////Dropping games: Banning user
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


////Dropping games striking the user
function strikeUser(req,generateStrike,handleStrike,res){
    console.log("Striking user");
    generateStrike(req,function(strike_tuple){
        User.findOneAndUpdate(
            {"steamid": req.body.steamid, "jackpots.jackpot_id": {$regex: "J(01|02)_[0-9]{8}"}},
            {$push: {"strikes": strike_tuple[0]}, $set: {current_strikes: strike_tuple[1],"jackpots.$.status": 'k'}},
            function(err,user){
                if((err) || (user === null)) {
                    res.redirect('./my_profile');
                }
                else if (user.current_strikes >= 3) {
                    banUser(req, res);
                }
                else{
                    console.log('Returning to current');
                    handleStrike(req,res);
                }
            })
    });
}


////Dropping games: Generate strike resgister
function generateStrikeDrop(req,callback){
    console.log('Generating strike');
    User.findOne({"steamid": req.body.steamid},function(err,user){
        const register = {
            strike_date: new Date(),
            strike_total: Number(user.current_strikes) + 1,
            strike_reason: "You dropped a game while the site was collecting information"
        };
        const strikes = Number(user.current_strikes) + 1;
        callback( [register,strikes] );
    });
}


////Dropping games: Handling strike
function handleStrikeDrop(req,res){
    res.send({message: 'You were issued a strike and kicked from all J01 and J02 jackpots.'})
}


////Dropping games: Drop function
function dropGame(req,callback){
    Game.findOneAndUpdate(
        {"appid": req.body.appid},
        {$pull: {"players": req.body.steamid}},
        function(err,game){
            if(err){
                console.log('Game error');
                console.log(err);
            }
        });
    User.findOneAndUpdate(
        {"steamid": req.body.steamid, "monitored.appid": req.body.appid},
        {$pull: {monitored:{appid: req.body.appid}}},
        function(err){
            console.log(err);
        }
    );
    callback()
}




//Getting getting user account data
router.get('/my_profile',steamAuth.ensureAuthenticated, localAuth.verifyToken,function(req, res){
    User.findOne({steamid: req.user.user.steamid}).lean().exec(function(err,user){
        if (!err){
            getActiveJackpots(user.jackpots,function(jackpots){
                getActiveGames(user.monitored,function(monitored){
                    const userJSON = {
                        steamid: user.steamid,
                        name: user.name,
                        joined: user.joined.toISOString().substring(0, 10),
                        thumbnail: user.thumbnail,
                        prizes: user.prizes,
                        banned: user.banned,
                        current_strikes: user.current_strikes,
                        jackpots:  jackpots,
                        monitored: monitored,
                        recommendations: user.recommendations,
                        strikes: user.strikes,
                        bans: user.bans,
                        events: user.additional
                    };
                    res.send(userJSON);
                })
            });
        }
    })
});


////My profile: Searching for active games
function getActiveGames(monitored,callback){
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
        callback(monitored)
    }
}


////My profile: Searching for active jackpots
function getActiveJackpots(jackpots,callback){
    for(let i = 0; i<jackpots.length; i++){
        console.log(jackpots[i].jackpot_id);
        Jackpot.findOne({jackpot_id: jackpots[i].jackpot_id}, function(err,jackpot){
            if(!err){
                console.log(jackpot.active);
                if(jackpot.active){
                    jackpots[i] = Object.assign(jackpots[i], {active: true})
                }
                else{
                    jackpots[i] = Object.assign(jackpots[i], {active: false})
                }
            }
            else{
                console.log(err)
            }
            if(i === jackpots.length - 1){
                callback(jackpots);
            }
        })
    }
    if(jackpots.length === 0){
        callback(jackpots);
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
