//Libraries
////Packages
const express = require('express');
const router = express.Router();
const request = require('request');
const path = require('path');
const Game = require('../object_db/game_db.js');


//Getting game data
router.get('/GetGameData/:appid',function(req, res){
    Game.findOne({appid: req.params.appid},function (err,game) {
        if(!err){
            const gameJSON = {
                steamgame: {
                    appid: game.appid,
                    name: game.name,
                    release: game.release.toISOString().substring(0, 10),
                    score: game.score,
                    thumbnail: game.image.split("'")[1]
                }
            };
            console.log(game);
            res.send(gameJSON)
        }
    })
});
router.get('/GetPrioritary',function(req, res){
    const prioritary = [];
    Game.find({priority:true},function (err,games) {
        if(!err){
            for (let i=0; i<games.length; i++) {
                const gameJSON = {
                    steamgame: {
                        appid: games[i].appid,
                        name: games[i].name,
                        release: games[i].release.toISOString().substring(0, 10),
                        score: games[i].score,
                        thumbnail: games[i].image.split("'")[1]
                    }
                };
                prioritary.push(gameJSON);
            }
            res.send(prioritary)
        }
    })
});

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
