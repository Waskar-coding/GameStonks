//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');
const request = require('request');

////Local
const Jackpot = require('../object_db/jackpot_db.js');
const Game = require('../object_db/game_db.js');
const User = require('../object_db/user_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');
const APIKEY = process.env.STEAM_PERSONAL_APIKEY;



router.post('/callGame', function(req,res) {
    for (games of req.body.features) {
        if (req.body.appid === game.appid) {

        }
    }
    res.status(404).send({message: "Game not found in jackpot features"});
});


async function firstFilter(req,){
    const isAuth = req.user.user !== null;
    let isKicked = false;
    let isListed = await checkGame(appid)
    if(isAuth === true){

    }

}
//Building steam API url
function buildURL(steamid){
    const STEAMAPI_BASE =  "http://api.steampowered.com";
    const STEAMAPI_ENV = "/IPlayerService";
    const STEAMAPI_FUNC = "/GetOwnedGames";
    const STEAMAPI_VERSION = "/v0001";
    const steam_params = {
        key: APIKEY,
        steamid: steamid,
        format: json
    };
    let url = STEAMAPI_BASE + STEAMAPI_ENV + STEAMAPI_FUNC + STEAMAPI_VERSION +'/?';
    for (const [key,value] in Object.entries(steam_params)){
        url = url + key + '=' + value + '&'
    }
    return new Promise(resolve => {resolve(url.slice(0,-1))});
}


//Making request to steam API
async function requestOwners(req,steamid){
    let status = 1;
    let playtime = 0;
    const steamUrl = await buildUrl()
    request(buildURL(steamid),{json: true}, (err,steam_res) => {
        if(response.statusCode === 200){
            for(game of steam_res.body.response.games){
                if(game.appid === req.body.appid){
                    status = 0;
                    playtime = game.playtime_forever;
                }
            }
        }
        else{
            status = 2;
        }
    });
    callback([status,playtime])
}


//Banning user
function banUser(req,current_jackpot,res){
    const register = {
        ban_start: new Date(),
        ban_type: 'B02',
        ban_active: true,
        ban_end: new Date(date.setTime( date.getTime() + 60 * 86400000 )),
        ban_doc: 'B02.txt'
    };
    User.findOne({steamid: req.user.user.steamid},function(err,user){
        if(!err){
            user.bans.push(register);
            user.current_strikes = 0;
            user.banned = true;
            for(jackpot of user.jackpots){
                if(jackpot.jackpot_id === current_jackpot.jackpot_id){
                    jackpot.status = 'k';
                    break;
                }
            }
            user.save().then(function(){res.redirect("/logout")})
        }
    })
}


//Striking user
function strikeUser(req,current_jackpot,res){
    User.findOne({steamid: req.user.user.steamid},function(err,user){
        if(!err){
            
        }
    })
}



//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;