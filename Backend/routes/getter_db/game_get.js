//Libraries
////Packages
var express = require('express');
var router = express.Router();
var request = require('request');
var path = require('path');
var Game = require('../object_db/game_db.js');


//Getting game data
router.get('/GetGameData/:appid',function(req, res){
    Game.findOne({appid: req.params.appid},function (err,game) {
        if(!err){
            var gameJSON = {
                steamgame : {
                    appid: game.appid,
                    name: game.name,
                    release: game.release.toISOString().substring(0,10),
                    score: game.score,
                    thumbnail: game.image.split("'")[1]
                    }
                };
            console.log(game)
            res.send(gameJSON)
        }
    })
});
router.get('/GetPrioritary',function(req, res){
    var prioritary = [];
    Game.find({priority:true},function (err,games) {
        if(!err){
            for (var i=0; i<games.length; i++) {
                var gameJSON = {
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