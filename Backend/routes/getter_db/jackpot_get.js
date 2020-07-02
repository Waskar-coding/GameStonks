//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const Jackpot = require('../object_db/jackpot_db.js');
const User = require('../object_db/user_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');



//Current jackpots
////Getting number of current jackpots with the given criteria
const getCurrentNum = (req, search) => {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            reject('Timeout')
        }, 3000);
        Jackpot.find({active: true})
            .then(jackpots => {
                resolve(
                    jackpots.filter(
                        jackpot => {
                            return(
                                (search.test(jackpot['jackpot_title'][req.query.language]))
                                ||
                                (search.test(jackpot['jackpot_entity']))
                            )
                        }
                    ).length
                )
            })
            .catch(err => {
                reject(err)
            })
    })
};
////Getting current jackpots with the given criteria
const getCurrent = (req,search) => {
    const display = 2;
    return new Promise((resolve,reject) => {
        setTimeout(() => {reject('Timeout')},3000);
        Jackpot.find({active:true})
            .sort({[req.query.sort]: req.query.order})
            .then(current => {
                const offset = display*(req.query.page-1);
                resolve(
                    current.filter(
                        jackpot => {
                            return(
                                (search.test(jackpot['jackpot_title'][req.query.language]))
                                ||
                                (search.test(jackpot['jackpot_entity']))
                            )
                        }
                    ).slice(offset, offset + display)
                )
            })
            .catch((err) => {
                reject(err)
            })
    })
};
////Getting user jackpot register
const getUserRegister = (req) => {
    return new Promise((resolve) => {
        if(req.user){
            User.findOne({steamid: req.user.user.steamid})
                .then(user => resolve(user.jackpots))
        }
        else{
            resolve([]);
        }
    })
};
////Assigning jackpot status to user
async function assignJackpotStatus(req,search){
    const current = (await getCurrent(req,search)).map(jackpot => {
        return ({
            jackpot_id: jackpot.jackpot_id,
            jackpot_title: jackpot.jackpot_title[req.query.language],
            jackpot_class: jackpot.jackpot_class,
            jackpot_entity: jackpot.jackpot_entity,
            start: jackpot.start,
            end: jackpot.end,
            total_value: jackpot.total_value,
            active_users: jackpot.active_users,
            user_status: 'i'
        })
    });
    const registers = await getUserRegister(req);
    const registerIds = registers.map(register => {return register.jackpot_id});
    if(registers.length === 0){
        return new Promise(resolve => {
          resolve(current)
        })
    }
    else{
        return new Promise(resolve => {
            resolve(
                current.map(jackpot => {
                    const jackpotIndex = registerIds.indexOf(jackpot.jackpot_id);
                    if(jackpotIndex !== -1){
                        jackpot.jackpot_status = registers[jackpotIndex].jackpot_status;
                    }
                    return jackpot
                })
            )
        })
    }
}

////Get Method
router.get('/current',async function(req,res){
    const search = new RegExp(req.query.search,'i');
    try{
        res.send(
            {
                current_n: await getCurrentNum(req,search),
                current: await assignJackpotStatus(req,search)
            });
    }
    catch(err){
        res.send({Error: 'Internal server error'})
    }
});


//Get a Jackpot
////Get a Jackpot: Check if the jackpot exists and is active
function isActive(req, res, next){
    Jackpot.findOne({jackpot_id: req.params.jackpot_id})
        .then(jackpot => {
            if((jackpot === null) || (jackpot.active === false)){
                res.status(404).send({
                    status: 'rejected',
                    exists: jackpot===null,
                    active: jackpot.active
                });
            }
            else{
                req.currentJackpot = {jackpot_id: jackpot.jackpot_id, jackpot_class: jackpot.jackpot_class};
                next()
            }
        })
        .catch(() => {
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
        const classFunction = require(`./Jackpot files/${jackpotClass}/${jackpotClass}.post.js`);
        classFunction(req,res)
    });


////Use a multiplier
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
                        User.findOne({steamid: req.user.user.steamid})
                            .then(user => {
                                if(user.multipliers.includes(req.body.multiplier)){
                                    const currentJackpot = user.jackpots.filter(jackpot => {
                                        return jackpot.jackpot_id === req.params.jackpot_id;
                                    }).pop();
                                    if(currentJackpot === undefined){
                                        res.send(
                                            {message: `User ${req.user.user.steamid} is not participating` +
                                                    `in the jackpot ${req.params.jackpot_id}`
                                        })
                                    }
                                    else if(currentJackpot.status === 'k') {
                                        res.send(
                                            {message: `User ${req.user.user.steamid} was kicked` +
                                                    `from jackpot ${req.params.jackpot_id}`
                                        })
                                    }
                                    else if(currentJackpot.multipliers.length >= jackpot.max_multipliers){
                                        res.send({message: `Max multipliers for jackpot already reached`})
                                    }
                                    else{
                                        const loadPath = `./Multiplier files/${req.body.multiplier_class}.js`;
                                        const classFunction = require(loadPath);
                                        classFunction(currentJackpot, req, res);
                                    }
                                }
                                else{
                                    res.send({message: `User ${req.user.user.steamid} does not have` +
                                            `a ${req.body.multiplier_class} multiplier`})
                                }
                            })
                            .catch(() => {
                                console.log('Could not find User');
                                res.status(500).send({Error: "Internal server error"})
                            })
                    }
                }
            )
            .catch(() => {
                console.log('Could not find jackpot');
                res.status(500).send({Error: "Internal server error"})
            })
    }
);
//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
