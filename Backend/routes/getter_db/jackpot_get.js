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



//Current events
router.get('/current',async function(req,res){
    const search = new RegExp(req.query.search,'i');
    try{
        const currentEvents = await getCurrent(req,search);
        res.send({
            current_n: currentEvents.count,
            current: await assignEventStatus(req,currentEvents.events)
        });
    }
    catch(err){
        res.send({Error: 'Internal server error'})
    }
});
////Jackpots with the given criteria
const getCurrent = (req,search) => {
    const displayPerPage = 2;
    const offset = displayPerPage * (req.query.page-1);
    return new Promise((resolve,reject) => {
        Jackpot.find({active:true})
            .sort({[req.query.sort]: req.query.order})
            .then(current => {
                const filteredCurrent = current.filter(
                    jackpot => {
                        return(
                            (search.test(jackpot['jackpot_title'][req.query.language]))
                            ||
                            (search.test(jackpot['jackpot_entity']))
                        )
                    }
                );
                const filteredCurrentCount = filteredCurrent.length;
                const filteredCurrentPage = filteredCurrent.slice(offset, offset + displayPerPage);
                resolve({
                    count: filteredCurrentCount,
                    events: filteredCurrentPage
                })
            })
            .catch((err) => {
                reject(err)
            })
    })
};
////User jackpot register
const getUserRegister = (req) => {
    return new Promise((resolve) => {
        if(req.user){
            User.findOne({steamid: req.user.user.steamid})
                .then(user => resolve(
                    user.jackpots.filter(jackpot =>{
                        return ['a','k'].includes(jackpot.status);
                    })
                ))
        }
        else{
            resolve([]);
        }
    })
};
////Assign jackpot status to user
async function assignEventStatus(req,events){
    const currentEvents = events.map(event => {
        return ({
            jackpot_id: event.jackpot_id,
            jackpot_title: event.jackpot_title[req.query.language],
            jackpot_class: event.jackpot_class,
            jackpot_thumbnail: event.jackpot_thumbnail,
            jackpot_entity: event.jackpot_entity,
            start: event.start,
            final: event.final,
            total_value: event.total_value,
            active_users: event.active_users,
            user_status: 'i'
        })
    });
    const registers = await getUserRegister(req);
    const registerIds = registers.map(register => {return register.jackpot_id});
    if(registers.length === 0){
        return new Promise(resolve => {
            resolve(currentEvents)
        })
    }
    else{
        return new Promise(resolve => {
            resolve(
                currentEvents.map(event => {
                    const eventIndex = registerIds.indexOf(event.jackpot_id);
                    if(eventIndex !== -1){
                        event.user_status = registers[eventIndex].status;
                    }
                    return event
                })
            )
        })
    }
}



//Event confirm
////Get a Jackpot: Check if the jackpot exists and is active
router.get('/:jackpot_id/active',function(req,res){
    /*
        Firstly we check for the current jackpot cookie
    */
    if(Object.keys(req.cookies).includes('currentJackpot')){
        const currentJackpot = req.cookies.currentJackpot;
        /*
            If the cookie exists and coincides with the selected jackpot
            the current jackpot we'll check whether the jackpot is finished
            or has returned and error previously. In case the jackpot is
            finished we'll check for changes in the end date with confirmJackpot
        */
        if(currentJackpot.jackpot_id === req.params.jackpot_id){
            if(
                (currentJackpot.error === null)
                &&
                (new Date(currentJackpot.jackpot_end) < new Date())
            ){
                confirmJackpot(req,res);
            }
            else{
                res.send(currentJackpot);
            }
        }
        else{
            /*
                If a new jackpot is selected it will be checked with
                confirmJackpot and the cookie will be updated
            */
            confirmJackpot(req,res);
        }
    }
    /*
        If the cookie does not exist the jackpot well
        be checked and a cookie will be created
    */
    else{
        confirmJackpot(req,res);
    }
});
function confirmJackpot(req,res){
    Jackpot.findOne({jackpot_id: req.params.jackpot_id})
        .then(jackpot => {
            /*
                If jackpot is not active or does not exist a a form with an error is sent
            */
            if((jackpot === null) || (jackpot.active === false)){
                const currentJackpot = {
                    jackpot_id: req.params.jackpot_id,
                    jackpot_final: new Date(),
                    error: (jackpot === null)? "jackpot-not-found" : "jackpot-not-active"
                };
                res.cookie('currentJackpot', currentJackpot);
                if(jackpot === null){
                    res.status(404).send(currentJackpot);
                }
                else{
                    res.status(403).send(currentJackpot);
                }

            }
            /*
                If the jackpot does exist it is registered as the current jackpot and sent
            */
            else{
                const currentJackpot = {
                    jackpot_id: jackpot.jackpot_id,
                    jackpot_title: jackpot.jackpot_title[req.query.language],
                    jackpot_class: jackpot.jackpot_class,
                    jackpot_final: jackpot.final,
                    error: null
                };
                res.cookie('currentJackpot', currentJackpot);
                res.send(currentJackpot);
            }
        })
        .catch(() => {
            res.send({
                jackpot_id: req.params.jackpot_id,
                jackpot_final: new Date(),
                error: "jackpot-505"
            })
        })
}



//Event's fetch methods
////Event action factory
function eventActionFactory(action, currentJackpot){
    /*
        Event APIs will be very diverse and it is not practical fetching a different
        API at the time in the frontend. This method aims to establish an easy way
        to import specific event APIs on demand using the parameters of the current
        event and one of the established actions within a jackpot which by today are:
            * global: Fetching global stats (public)
            * features: Fetching event's features (public)
            * post: Submitting data to the event (private)
            * personal: Fetching users event register (private)
        Private actions require auth middleware
    */
    const jackpotClass = (currentJackpot.jackpot_class !== 'special')?
        currentJackpot.jackpot_class
        :
        currrentJackpot.jackpot_id;
    return require(`./Jackpot files/${jackpotClass}/${jackpotClass}.${action}.js`);
}
////Public get
router.get(
    '/:jackpot_id/public/:action',
    function(req,res){
        eventActionFactory(req.params.action, req.cookies.currentJackpot)(req,res);
    }
);
////Private get
router.get(
    '/:jackpot_id/private/:action',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    function(req,res){
        eventActionFactory(req.params.action,req.cookies.currentJackpot)(req,res);
    }
);
////Private post
router.post(
    '/:jackpot_id/private/:action',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    function(req,res){
        eventActionFactory(req.params.action,req.cookies.currentJackpot)(req,res);
    }
);


////Multipliers
router.post(
    '/:jackpot_id/multiplier',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    function(req,res){
        jackpot.findOne({jackpot_id: req.params.jackpot_id})
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
                                res.status(500).send({Error: "Internal server error"})
                            })
                    }
                }
            )
            .catch(() => {
                res.status(500).send({Error: "Internal server error"})
            })
    }
);



//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});



module.exports = router;
