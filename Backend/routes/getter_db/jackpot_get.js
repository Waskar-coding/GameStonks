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



//Current jackpots
////Getting total active jackpots
const getTotalNum = () => {
    return new Promise((resolve, reject) => {
        Jackpot.count({active: true})
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            })
    })
};
////Getting number of current jackpots with the given criteria
const getCurrentNum = (req) => {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            reject('Timeout')
        }, 3000);
        Jackpot.count(
            {
                $and: [
                    {active: true}, {
                        $or: [
                            {
                                jackpot_title: {
                                    "$regex": req.query.search,
                                    $options: 'i'
                                }
                            }, {jackpot_entity: {"$regex": req.query.search, $options: 'i'}}]
                    }]
            })
            .then(n => {
                resolve(n)
            })
            .catch(err => {
                reject(err)
            })
    })
};
////Getting current jackpots with the given criteria
const getCurrent = (req) => {
    const sortCriteria = req.query.sort;
    const orderCriteria = req.query.order;
    const searchCriteria = req.query.search;
    const offset = req.query.page;
    console.log(sortCriteria);
    const display = 2;
    return new Promise((resolve,reject) => {
        setTimeout(() => {reject('Timeout')},3000);
        Jackpot.find(
            {$and:[
                    {active:true}, {$or:[
                            {jackpot_title: {"$regex": req.query.search, $options: 'i'}},
                            {jackpot_entity: {"$regex": req.query.search, $options: 'i'}}]
                    }]})
            .sort({[sortCriteria]: orderCriteria})
            .skip((offset-1)*display)
            .limit(display)
            .then((current) => {
                resolve(current)
            })
            .catch((err) => {
                reject(err)
            })
    })
};
////Getting user jackpot register
const getUserRegister = (req) => {
    return new Promise((resolve, reject) => {
        if(req.user){
            User.findOne({steamid: req.user.user.steamid})
                .then(user => resolve(user.jackpots))
        }
        else{
            console.log('We failed mem');
            resolve([{}]);
        }
    })
};
////Assigning jackpot status to user
async function assignJackpotStatus(req){
    const current = await getCurrent(req);
    const registers = await getUserRegister(req);
    return new Promise((resolve,reject) => {
        const jackpots = [];
        const checkedJackpots = [];
        let currentJackpot = {};
        if(current.length === 0){
            reject()
        }
        else{
            for(let i = 0; i<current.length; i++){
                currentJackpot = {
                    jackpot_id: current[i].jackpot_id,
                    jackpot_title: current[i].jackpot_title,
                    jackpot_class: current[i].jackpot_class,
                    jackpot_entity: current[i].jackpot_entity,
                    start: current[i].start,
                    end: current[i].end,
                    total_value: current[i].total_value,
                    active_users: current[i].active_users,
                    user_status: 'new'
                };
                let isRegistered;
                for(let j = 0; j<registers.length; j++){
                    if(current[i].jackpot_id === registers[j].jackpot_id){
                        currentJackpot.user_status = registers[j].status;
                        jackpots.push(currentJackpot);
                        if(i === current.length-1){
                            resolve(jackpots);
                        }
                        break;
                    }
                    else if(j === registers.length-1){
                        jackpots.push(currentJackpot);
                        if(i === current.length-1){
                            resolve(jackpots);
                        }
                    }
                }
            }
        }
    })
}
////Main function
async function getJackpotData(req, res){
    try{
        res.send(
            {
                total_n: await getTotalNum(),
                current_n: await getCurrentNum(req),
                current: await assignJackpotStatus(req)
            });
    }
    catch(err){
        res.send({message: 'An error has ocurred'})
    }
}
////Get Method
router.get('/current',function(req,res){
    console.log('Getting current');
    getJackpotData(req, res)
});



//Get a Jackpot
////Get a Jackpot: Check if the jackpot exists and is active
function isActive(req, res, next){
    Jackpot.findOne({jackpot_id: req.params.jackpot_id})
        .then(jackpot => {
            if((jackpot === null) || (jackpot.active === false)){
                console.log(`User selected an invalid jackpot`);
                res.redirect('/jackpots/current?sort=start&order=1&search=&page=1')
            }
            else{
                req.currentJackpot = jackpot;
                next()
            }
        })
        .catch(err => {
            res.status(500).send({Error: 'Error 500: Internal server error'})
        })
}
////Get a Jackpot: Jackpot data
router.get(
    '/:jackpot_id/global',
    isActive,
    function(req,res){
        Jackpot.findOne({jackpot_id: req.params.jackpot_id})
            .then(jackpot => {
                res.send({
                    title: jackpot.jackpot_title,
                    entity: jackpot.jackpot_entity,
                    current_value: jackpot.total_value,
                    current_users: jackpot.users.length,
                    start: jackpot.start,
                    end: jackpot.end,
                    has_multipliers: jackpot.has_multipliers,
                    users: jackpot.users_timetable,
                    price: jackpot.price_timetable,
                    score: jackpot.wealth_distribution,
                    top: jackpot.top_users
                })
            })
            .catch(err => {
                console.log(err);
                res.status(505).send({Error: 'Internal server error'})
            })
    }
);
////Get a Jackpot: Features
router.get(
    '/:jackpot_id/features',
    isActive,
    function(req,res){
        const jackpotClass = (req.currentJackpot.jackpot_class !== 'special')? req.currentJackpot.jackpot_class : req.currentJackpot.jackpot_id;
        const loadPath = `./Jackpot files/${jackpotClass}/${jackpotClass}.features.js`;
        const classFunction = require(loadPath);
        classFunction(req,res)
});


//Post in a jackpot
router.post(
    '/:jackpot_id/post',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    isActive,
    function(req,res){
        const jackpotClass = (req.body.jackpot_class !== 'special')? req.body.jackpot_class : req.body.jackpot_id;
        const loadPath = `./Jackpot files/${jackpotClass}/${jackpotClass}.post.js`;
        const classFunction = require(loadPath);
        classFunction(req,res)
    });

router.post(
    '/:jackpot_id/multiplier',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    isActive,
    function(req,res){
        Jackpot.findOne({jackpot_id: req.params.jackpot_id})
            .then(jackpot => {
                    if(jackpot.max_multipliers === 0){
                        res.send({message: `Jackpot ${req.params.jackpot_id} does not allow multipliers`})
                    }
                    else{
                        console.log('Clicked');
                        User.findOne({steamid: req.user.user.steamid})
                            .then(user => {
                                if(user.multipliers.includes(req.body.multiplier)){
                                    const currentJackpot = user.jackpots.filter(jackpot => {
                                        return jackpot.jackpot_id === req.params.jackpot_id;
                                    }).pop();
                                    if(currentJackpot === undefined){
                                        res.send({message: `User ${req.user.user.steamid} is not participating in the jackpot ${req.params.jackpot_id}`})
                                    }
                                    else if(currentJackpot.status === 'k') {
                                        res.send({message: `User ${req.user.user.steamid} was kicked from jackpot ${req.params.jackpot_id}`})
                                    }
                                    else if(currentJackpot.multipliers.length >= jackpot.max_multipliers){
                                        res.send({message: `Max multipliers for jackpot already reached`)
                                    }
                                    else{
                                        const loadPath = `./Multiplier files/${req.body.multiplier_class}.js`;
                                        const classFunction = require(loadPath);
                                        classFunction(currentJackpot, req, res);
                                    }
                                }
                                else{
                                    res.send({message: `User ${req.user.user.steamid} does not have a ${req.body.multiplier_class} multiplier`})
                                }
                            })
                    }
                }
            )
            .catch(err => {res.status(500).send({Error: "Internal server error"})})
    }
);
//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;