const Game = require('../../../object_db/game_db.js');
const User = require('../../../object_db/user_db.js');

//Class J01 loading function
function loadJ01(req,res){
    const ContentFunctions = {
        'inputs': getJ01Inputs,
    };
    ContentFunctions[req.query.content](req,res)
}


//Inputs: Get total valid games
function getJ01Total(){
    return new Promise((resolve,reject) => {
        Game.count({current_state: {$in: ["al","s"]}})
            .then((count) => {resolve(count)})
            .catch((err) => {reject(err)})
    })
}

//Inputs: Get current valid games
function getJ01Current(req){
    return new Promise((resolve,reject) => {
        Game.count({current_state: {$in: ["al","s"]}, name: {"$regex": req.query.search, $options: 'i'}})
            .then((count) => {resolve(count)})
            .catch((err) => {reject(err)})
    })
}

//Inputs: Main function
async function getJ01Inputs(req, res){
    res.send({
        active_games: await getJ01GameRegisters(req, await getJ01Games(req)),
        current_n: await getJ01Current(req),
        total_n: await getJ01Total()
    })
}

//Inputs: Getting games for J01 jackpot
function getJ01Games(req){
    const gamesPerPage = 10;
    return new Promise((resolve,reject) => {
        Game.find({current_state: {$in: ["al","s"]}, name: {"$regex": req.query.search, $options: 'i'}})
            .sort({[req.query.sort]: req.query.order})
            .limit(gamesPerPage)
            .skip((req.query.page-1)*gamesPerPage)
            .then((gameArray) => {
                const newGameArray = gameArray.map(function(game){
                    return {
                        appid: game.appid,
                        name: game.toJSON().name,
                        release: game.release.toString().substring(0,15),
                        thumbnail: game.image_url
                    };
                });
                resolve(newGameArray);
            })
            .catch((err) => (reject(err)))
    })
}

//Inputs: Checking user registers to determine game status
function getJ01GameRegisters(req, gameArray){
    return new Promise((resolve, reject) => {
        if(req.user){
            User.findOne({steamid: req.user.user.steamid})
                .then(user => {
                    const monitoredArray = user.monitored;
                    const userJackpot = user.jackpots.filter(jackpot => {
                        return jackpot.jackpot_id === req.params.jackpot_id;
                    }).pop();
                    let isKicked = false;
                    if(userJackpot){
                        isKicked = userJackpot.status === 'k';
                    }
                    const newGameArray = gameArray.map((game) => {
                        console.log('Mapping game array');
                        if(userJackpot === undefined){
                            console.log('Hello');
                            return {
                                appid: game.appid,
                                name: game.name,
                                release: game.release,
                                thumbnail: game.thumbnail,
                                registered: 2
                            };
                        }
                        else if(isKicked === true){
                            return {
                                appid: game.appid,
                                name: game.name,
                                release: game.release,
                                thumbnail: game.thumbnail,
                                registered: 0
                            };
                        }
                        else if(monitoredArray.length === 0){
                            return {
                                appid: game.appid,
                                name: game.name,
                                release: game.release,
                                thumbnail: game.thumbnail,
                                registered: 2
                            };
                        }
                        for(let i=0; i<monitoredArray.length; i++){
                            if(game.appid === monitoredArray[i].appid){
                                return {
                                    appid: game.appid,
                                    name: game.name,
                                    release: game.release,
                                    thumbnail: game.thumbnail,
                                    registered: 1
                                };
                            }
                            else if(i === monitoredArray.length-1){
                                return {
                                    appid: game.appid,
                                    name: game.name,
                                    release: game.release,
                                    thumbnail: game.thumbnail,
                                    registered: 2
                                };
                            }
                        }
                    });
                    resolve(newGameArray);
                })
        }
        else{
            console.log('User not found');
            const newGameArray = gameArray.map((game) => {
                return {
                    appid: game.appid,
                    name: game.name,
                    release: game.release,
                    thumbnail: game.thumbnail,
                    registered: 3
                }
            });
            resolve(newGameArray);
        }
    })
}


module.exports = loadJ01;