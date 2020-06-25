//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const User = require('../object_db/user_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');


//User's account data
router.get(
    '/my_profile',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    function(req, res){
        User.findOne({steamid: req.user.user.steamid})
            .then(user => {

                res.send({
                    steamid: user.steamid,
                    name: user.name,
                    joined: user.joined.toISOString().substring(0, 10),
                    thumbnail: user.thumbnail,
                    profile_url: user.profile_url,
                    wealth: user.wealth,
                    requests: user.requests,
                    jackpots:  user.jackpots.filter(jackpot => {return jackpot.status === 'a'})
                        .map(jackpot => {return jackpot.jackpot_id}),
                    jackpot_number: user.jackpots.length,
                    question_number: user.questions,
                    multipliers: user.multipliers,
                    strikes: user.strikes
                });
            })
            .catch(() => {
                res.send({Error: "Internal server error"})
            })
});


//User's timeline
router.get(
    '/my_timeline',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    function(req, res){
        User.findOne({steamid: req.user.user.steamid})
            .then(user => {
                const timeline = user.general_timeline.filter(event => {
                    const eventDate = new Date(event[0]);
                    const startDate = new Date(req.query.start);
                    const finalDate = new Date(req.query.end);
                    return (eventDate > startDate) && (eventDate < finalDate);
                });
                if(req.query.type === 'graph'){
                    res.send({
                        timeline: timeline,
                        wealth_timetable: user.wealth_timetable.filter(point => {
                            const pointDate = new Date(point[0]);
                            const startDate = new Date(req.query.start);
                            const finalDate = new Date(req.query.end);
                            return (pointDate > startDate) && (pointDate < finalDate);
                        })
                    });
                }
                else{
                    res.send({
                        timeline: timeline
                    })
                }
            })
            .catch(() => {
                res.send({
                    Error: 'Internal server error'
                })
            })
});


//Donate money to a friend
router.post(
    '/donate',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    function(req,res){
        checkDonation(
            req.user.user.steamid,
            req.body.friendId,
            req.body.transferredWealth,
            new Date(req.body.timeline1Start),
            new Date(req.body.timeline1Final),
            new Date(req.body.timeline2Start),
            new Date(req.body.timeline2Final),
            res
        ).then(console.log("Successful donation"))
    }
);

async function checkDonation(
    userId,
    friendId,
    transferredWealth,
    timeline1Start,
    timeline1Final,
    timeline2Start,
    timeline2Final,
    res
){
    const [serverError1, hasWealth, userName, currentUserWealth] = await checkUserWealth(userId, transferredWealth);
    const [serverError2, isRegistered, friendName, currentFriendWealth] = await checkFriendWealth(friendId);
    if(userId === friendId){
        res.send(
            {
                status: 'rejected',
                sameId: false,
                hasWealth: hasWealth,
                isRegistered: isRegistered
            }
        )
    }
    else if((serverError1 !== false) || (serverError2 !== false)){
        res.send(
            {
                status: 'error'
            }
        )
    }
    else if((hasWealth === true) && (isRegistered === true)){
        transferWealth(
            userId,
            friendId,
            userName,
            friendName,
            transferredWealth,
            currentUserWealth,
            currentFriendWealth,
            timeline1Start,
            timeline1Final,
            timeline2Start,
            timeline2Final,
            res
        ).then(console.log("Successful transfer"))
    }
    else{
        res.send(
            {
                status: 'rejected',
                sameId: true,
                hasWealth: hasWealth,
                isRegistered: isRegistered
            }
        )
    }
}

function checkUserWealth(
    userId,
    transferredWealth
){
    return new Promise((resolve) => {
        User.findOne({steamid: userId})
            .then(user => {
                resolve([
                    false,
                    user.wealth >= transferredWealth,
                    user.name,
                    user.wealth
                ])
            })
            .catch(err => {
                resolve([
                    err,
                    null,
                    null,
                    null

                ])
            })
    })
}

function checkFriendWealth(
    friendId
){
    return new Promise((resolve) => {
        User.findOne({steamid: friendId})
            .then(friend => {
                if(friend === null){
                    resolve([
                        false,
                        false,
                        null,
                        null
                    ])
                }
                else{
                    resolve([
                        false,
                        true,
                        friend.name,
                        friend.wealth
                    ])
                }
            })
            .catch(err => {
                resolve([
                    err,
                    false,
                    null,
                    null
                ])
            })
    })
}

async function transferWealth(
    userId,
    friendId,
    userName,
    friendName,
    transferredWealth,
    currentUserWealth,
    currentFriendWealth,
    timeline1Start,
    timeline1Final,
    timeline2Start,
    timeline2Final,
    res
    ){
    const [wealth, donationRegister] = await subtractFromUser(
        userId,
        friendName,
        transferredWealth,
        currentUserWealth
    );
    const receivedRegister = await addToFriend(
        friendId,
        userName,
        transferredWealth,
        currentFriendWealth
    );
    res.send(
        {
            status: 'success',
            userWealth: wealth,
            updateTimeline1: (
                (donationRegister[0] >= timeline1Start)
                &&
                (donationRegister[0] <= timeline1Final)
            )? [[donationRegister[0], wealth], donationRegister] : null,
            updateTimeline2: (
                (donationRegister[0] >= timeline2Start)
                &&
                (donationRegister[0] <= timeline2Final)
            )? donationRegister : null,
            friendRegister: receivedRegister
        }
    );
}

function subtractFromUser(
    userId,
    friendName,
    transferredWealth,
    currentUserWealth
){
    return new Promise((resolve,reject) => {
        const donationRegister = [
            new Date(),
            'G',
            'D',
            transferredWealth,
            friendName
        ];
        User.findOneAndUpdate(
            {steamid: userId},
            {
                $inc: {
                    wealth: -transferredWealth
                },
                $push: {
                    wealth_timetable: [
                        new Date(),
                        Number(currentUserWealth) - Number(transferredWealth)
                    ],
                    general_timeline: donationRegister
                }
            },
            {new: true}
        )
            .then(user => {resolve([user.wealth, donationRegister])})
            .catch(err => reject(err))
    })
}

function addToFriend(
    friendId,
    userName,
    transferredWealth,
    currentFriendWealth
){
    return new Promise((resolve, reject) => {
        const receivedRegister = [
            new Date(),
            'G',
            'R',
            transferredWealth,
            userName
        ];
        User.findOneAndUpdate(
            {steamid: friendId},
            {
                $inc: {
                    wealth: transferredWealth
                },
                $push: {
                    wealth_timetable: [new Date(), Number(currentFriendWealth) + Number(transferredWealth)],
                    general_timeline: receivedRegister
                }
            }
        )
            .then(() => {
                resolve(receivedRegister)
            })
            .catch(err => reject(err))
    })
}


router.post(
    'request',
    function(req,res){
        const userId = req.body.userId;
        const request = req.body.request;
        const timeline1Start = req.body.timeline1Start;
        const timeline1Final = req.body.timeline1Final;
        const timeline2Start = req.body.timeline2Start;
        const timeline2Final = req.body.timeline2Final;
        User.findOne({steamid: userId})
            .then(user => {
                if(user.wealth < request){
                    res.send({
                        status: 'rejected'
                    })
                }
                else{
                    const requestRegister = [
                        new Date(),
                        'R',
                        'Steam',
                        request
                    ];
                    User.findOneAndUpdate(
                        {steamid: userId},
                        {
                            $inc: {
                                wealth: -request
                            },
                            $push: {
                                general_timeline: requestRegister,
                                wealth_timetable: [new Date(), user.wealth - request]
                            }
                        },
                        {new: true}
                    )
                        .then(newUser => {
                            res.send({
                                status: 'success',
                                userWealth: newUser.wealth,
                                updateTimeline1: (
                                    (requestRegister[0] >= timeline1Start)
                                    &&
                                    (requestRegister[0] <= timeline1Final)
                                )? [[requestRegister[0], wealth], requestRegister] : null,
                                updateTimeline2: (
                                    (requestRegister[0] >= timeline2Start)
                                    &&
                                    (requestRegister[0] <= timeline2Final)
                                )? requestRegister : null
                            })
                        })
                        .catch(err => {
                            res.send({Error: 'Internal server error'})
                        })
                }
            })
            .catch(err => {
                res.send({Error: 'Internal server error'})
            })
    }
);

//Friend's account datta
router.get(
    '/profiles/:name',
    function(req,res){
       User.findOne({name: req.params.name})
           .then(user => {
               res.send({
                   steamid: user.steamid,
                   thumbnail: user.thumbnail,
                   profile_url: user.profile_url,
                   name: user.name,
                   joined: user.joined,
                   wealth: user.wealth,
                   current_strikes: user.current_strikes,
                   jackpots: user.jackpots.filter(jackpot => {return jackpot.jackpot_id}),
                   questions: user.questions.length,
                   multipliers: user.multipliers,
                   strikes: user.strikes
               })
           })
           .catch(() => res.send({Error: "Internal server error"}))
});


//Finding friends by name
router.get(
    '/find',
    function(req, res){
        const usersPerPage = 2;
        User.find({name: {"$regex": req.query.search, $options: 'i'}})
            .collation({locale: "en"})
            .sort({[req.query.sort]: req.query.order})
            .limit(usersPerPage)
            .skip((req.query.page-1)*usersPerPage)
            .then(users => {
                User.count({name: {"$regex": req.query.search, $options: 'i'}})
                    .then(count => {
                        const userList = users.map(user => {
                            return {name: user.name, thumbnail: user.thumbnail, joined: user.joined}
                        });
                        if(req.user){
                            res.send({count: count, profiles: userList, my_name: req.user.user.name});
                        }
                        else{
                            res.send({count: count, profiles: userList, my_name: undefined})
                        }
                    })
            })
            .catch(() => {
                res.status(500).send({Error: "Internal server error"})
            })
});



//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
