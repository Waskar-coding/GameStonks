//Imports
////Local
const Game = require('../../../object_db/game_db.js');
const User = require('../../../object_db/user_db.js');
const Jackpot = require('../../../object_db/jackpot_db.js');
const APIKEY = process.env.STEAM_PERSONAL_APIKEY;

////Packages
const request = require('request');
const Math = require('math');

//J01 Main post function
function postJ01(req,res){
    const ContentFunctions = {
        'call': firstFilter
    };
    ContentFunctions[req.query.action](req.user.user.steamid, req.body.jackpot_id, req.body.data, res)
}

//Call game
////First filter
//////Main function
async function firstFilter(steamid, jackpotId, appId, res){
    const userArray = await checkUser(steamid, jackpotId, appId);
    const isActive = await checkActive(appId);
    const isKicked = userArray[0];
    const isSharer = userArray[1];
    const isShared = userArray[2];
    if((isSharer === true) && (isKicked === false) && (isActive === true) && (isShared === false)){
        return secondFilter(steamid, jackpotId, appId, res);
    }
    else if(!isSharer && !isKicked && (isActive === true) && (isShared === false)){
        return createJackpotRegister(steamid, jackpotId, appId,res);
    }
    else{
        res.send({Error: 'Could not pass first filter'})
    }
}

//////Checking if game can be called
function checkActive(appId){
    return new Promise((resolve,reject) => {
        Game.findOne({appid: appId})
            .then((game) => {
                if((game === null) || (!game.current_state in ['al','s'])){
                    resolve(false)
                }
                else{
                    resolve(true)
                }
            })
            .catch((err) => {reject(err)})
    })
}

//////Checking if user is in the jackpot or kicked
////////Main
async function checkUser(steamid, jackpotId, appId){
    const user = await getUser(steamid);
    if(user.banned === true){
        const registerArray = [true, false];
        const isShared = true;
        return new Promise(resolve => {
            resolve([registerArray[0],registerArray[1], isShared])
        });
    }
    else{
        const registerArray = await checkRegister(user, jackpotId);
        const isShared = await checkMonitored(user, appId);
        return new Promise(resolve => {
            resolve([registerArray[0],registerArray[1], isShared])
        });
    }
}
////////Getting user
function getUser(steamid){
    return new Promise((resolve,reject) => {
        User.findOne({steamid : steamid})
            .then(user => resolve(user))
            .catch(err => reject(err))
    })
}
////////Checking if user is not registered or kicked
function checkRegister(user, jackpotId){
    return new Promise((resolve) => {
        let isKicked = false;
        let isSharer = false;
        for(let jackpot of user.jackpots){
            if(jackpot.jackpot_id === jackpotId) {
                isSharer = true;
                isKicked = jackpot.status === 'k';
            }
        }
        resolve([isKicked, isSharer])
    })
}
////////Checking if user already called the game
function checkMonitored(user, appId){
    return new Promise((resolve) => {
        let isShared = false;
        for(let game of user.monitored){
            if(game.appid === appId){
                isShared = true;
            }
        }
        resolve(isShared)
    })
}


////Create a jackpot register
async function createJackpotRegister(steamid, jackpotId, appId,res){
    if((await addUserToJackpot(steamid, jackpotId))&&(await addJackpotToUser(steamid,jackpotId))){
        return secondFilter(steamid, jackpotId, appId,res);
    }
    else{
        console.log(`Internal server error at ${new Date()}`)
    }
}

//////Adding jackpot information to profile
function addJackpotToUser(steamid, jackpotId, res){
    return new Promise ((resolve, reject) => {
        const newRegister = {
            jackpot_id: jackpotId,
            status: 'i',
            score: 0,
            share_timetable: [],
            date: new Date(),
            recommendations: [],
            multipliers: []
        };
        User.findOneAndUpdate({steamid: steamid},{$push: {jackpots: newRegister}})
            .then(resolve(true))
            .catch(reject(res.status(500).send({Error: 'Internal server error'})));
    });
}

////Adding user to the jackpot list of participants
function addUserToJackpot(steamid, jackpotId, res){
    return new Promise ((resolve, reject) => {
        Jackpot.findOneAndUpdate({jackpot_id:jackpotId},{$push: {users: steamid}})
            .then(resolve(true))
            .catch(reject(res.status(500).send({Error: 'Internal server error'})))
    });
}


////Second filter
//////Main function
async function secondFilter(steamid, jackpotId, appId, res){
    const steamResponse = await requestOwned(steamid, appId);
    if(steamResponse !== null){
        const ownerArray = await checkOwnership(appId, steamResponse);
        if(ownerArray[0] === true){
            return rewardUser(steamid, jackpotId, appId, ownerArray[1], res);
        }
        else{
            return strikeUser(steamid,jackpotId, appId, res);
        }
    }
    else{
        return banUser(steamid, jackpotId, res);
    }
}

//////Building steam API url
function buildUrl(steamid){
    const STEAMAPI_BASE =  "http://api.steampowered.com";
    const STEAMAPI_ENV = "/IPlayerService";
    const STEAMAPI_FUNC = "/GetOwnedGames";
    const STEAMAPI_VERSION = "/v0001";
    const steam_params = {
        key: APIKEY,
        steamid: steamid,
        format: "json",
        include_played_free_games: "true"
    };
    return `${STEAMAPI_BASE}${STEAMAPI_ENV}${STEAMAPI_FUNC}${STEAMAPI_VERSION}?key=${steam_params.key}&steamid=${steam_params.steamid}&format=${steam_params.format}&include_played_free_games=${steam_params.include_played_free_games}`
}

//////Making request to steam API
async function requestOwned(steamid){
    return new Promise((resolve, reject) => {
        request(buildUrl(steamid), {json: true}, (err, steamResponse) => {
            if(!err){
                if(steamResponse.statusCode === 200){
                    resolve(steamResponse);
                }
                else{
                    resolve(null)
                }
            }
            else{
                reject(res.status(500).send({Error: 'Cannot connect with SteamAPI'}))
            }
        });
    });
}

//////Checking game ownership
function checkOwnership(appId, steamResponse){
    return new Promise(resolve => {
        let isOwner = false;
        let playtime = 0;
        for(let game of steamResponse.body.response.games){
            if(game.appid.toString() === appId){
                isOwner = true;
                playtime = game.playtime_forever;
                resolve([isOwner, playtime]);
                break;
            }
        }
        resolve([isOwner, playtime])
    })
}

//////Reward user
async function rewardUser(steamid, jackpotId, appId, playtime, res){
    const lambda = 4;
    const mi = 4;
    const user = await getUser(steamid);
    const game = await new Promise((resolve, reject) => {
       Game.findOneAndUpdate({appid: appId},{$push: {players: steamid}})
           .then(game => {
               resolve(game)
           })
           .catch(err => reject(res.status(500).send({Error: 'Internal server error'})))
    });
    const scoreIncrement = (1 + user.loyalty) * game.base_value * (Math.exp(-playtime/120) / (Math.pow(game.players.length+1,1/lambda) * Math.pow(user.monitored.length+1,1/mi)));
    const currentJackpot = await new Promise((resolve, reject) => {
        Jackpot.findOneAndUpdate({jackpot_id: jackpotId},{
            $inc: {total_score: scoreIncrement}
        })
            .then(jackpot => {resolve(jackpot)})
            .catch(err => reject(res.status(500).send({Error: 'Internal server error'})))
    });
    const gameRegister = {
        appid: appId,
        name: game.name,
        total_gameplay: playtime,
        register_date: new Date()
    };
    console.log(gameRegister);
    for(let jackpot of user.jackpots){
        if(jackpot.jackpot_id === jackpotId){
            const prevScore = jackpot.score;
            User.findOneAndUpdate(
                {steamid: steamid, "jackpots.jackpot_id": jackpotId},
                {
                    $inc : {"jackpots.$.score": scoreIncrement},
                    $set: {"jackpots.$.status": "a"},
                    $push: {
                        monitored: gameRegister,
                        "jackpots.$.share_timetable": [new Date() , currentJackpot.total_value * (prevScore + scoreIncrement) / currentJackpot.total_score]
                    }
                },{new: true})
                .then(user => {
                    const currentJackpot = user.jackpots.filter(jackpot => {return jackpot.jackpot_id === jackpotId}).pop();
                    const currentScore = currentJackpot.share_timetable[currentJackpot.share_timetable.length-1][1];
                    res.send({outcome: 'rewarded', info: currentScore})
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send({Error: 'Internal server error'})
                })
        }
    }
}

//////Striking User
function strikeUser(steamid,jackpotId, appId, res){
    const register = {
        strike_reason: `You did not own a game (steam appid: ${appId}) but called it in  ${jackpotId}`,
        strike_date: new Date()
    };
    User.findOneAndUpdate(
        {steamid: steamid, "jackpots.jackpot_id": jackpotId},
        {
            $inc:{current_strikes: 1},
            $push: {strikes: register},
            $set: {"jackpots.$.status": 'k', "jackpots.$.score": 0}
        })
        .then(user => {
            if(user.current_strikes > 2){
                banUser(steamid, jackpotId, res)
            }
            else{
                res.send({outcome: 'kicked', info: user.current_strikes})
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({Error: 'Internal server error'})
        })
}

//////Banning user
function banUser(steamid, jackpotId, res){
    const date = new Date();

    const register = {
        ban_start: date,
        ban_type: 'B02',
        ban_active: true,
        ban_end: date.setTime( date.getTime() + 60 * 86400000 ),
        ban_doc: `You used a private profile in event ${jackpotId} and forced us to loose time, that is against the rules of our page.`
    };
    User.findOneAndUpdate(
        {steamid: steamid, "jackpots.status": {$in: ["a","i"]}},
        {
            $set: {banned: true, current_strikes: 0, "jackpots.$.status": 'k', "jackpots.$.score": 0},
            $push: {bans: register}
        })
        .then( user => {
                console.log(`User ${user.steamid} banned`);
                res.redirect('/logout')
            }
        )
        .catch(err => {
                console.log(err);
                res.status(500).send({Error: 'Internal server error'})
            }
        )
}



module.exports = postJ01;