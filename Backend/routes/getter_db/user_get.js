//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const User = require('../object_db/user_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');



//Verify user is autenticted
router.get(
    '/verify',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    function(req,res){
        res.send({
            auth: true
        })
    }
);
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
                        }),
                        joined: user.joined
                    });
                }
                else{
                    res.send({
                        timeline: timeline,
                        joined: user.joined
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
        )
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
        )
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
            Number(transferredWealth),
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
                        [
                            new Date(),
                            Number(currentUserWealth) - Number(transferredWealth)
                        ]
                    ],
                    general_timeline: [donationRegister]
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
            Number(transferredWealth),
            userName
        ];
        User.findOneAndUpdate(
            {steamid: friendId},
            {
                $inc: {
                    wealth: transferredWealth
                },
                $push: {
                    wealth_timetable: [[new Date(), Number(currentFriendWealth) + Number(transferredWealth)]],
                    general_timeline: [receivedRegister]
                }
            }
        )
            .then(() => {
                resolve([receivedRegister])
            })
            .catch(err => reject(err))
    })
}



//Charge Steam account
router.post(
    '/request',
    steamAuth.ensureAuthenticated,
    localAuth.verifyToken,
    function(req,res){
        const userId = req.user.user.steamid;
        const request = Number(req.body.request);
        const timeline1Start = new Date(req.body.timeline1Start);
        const timeline1Final = new Date(req.body.timeline1Final);
        const timeline2Start = new Date(req.body.timeline2Start);
        const timeline2Final = new Date(req.body.timeline2Final);
        User.findOne({steamid: userId})
            .then(user => {
                if(
                    (user.wealth < request)
                    ||
                    ([5,10,20,25,50,100].includes(request) === false)
                    ||
                    (user.requests.length > 2)
                ){
                    res.send({
                        status: 'rejected'
                    })
                }
                else{
                    const requestRegister = {
                        request_date: new Date(),
                        request_type: 'Steam',
                        request_cash: request
                    };
                    const requestEvent = [
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
                                general_timeline: [requestEvent],
                                wealth_timetable: [[new Date(), user.wealth - request]],
                                requests: [requestRegister]
                            }
                        },
                        {new: true}
                    )
                        .then(newUser => {
                            res.send({
                                status: 'success',
                                userWealth: newUser.wealth,
                                updateTimeline1: (
                                    (requestEvent[0] >= timeline1Start)
                                    &&
                                    (requestEvent[0] <= timeline1Final)
                                )? [[requestEvent[0], newUser.wealth], requestEvent] : null,
                                updateTimeline2: (
                                    (requestEvent[0] >= timeline2Start)
                                    &&
                                    (requestEvent[0] <= timeline2Final)
                                )? requestEvent : null,
                                request: requestRegister
                            })
                        })
                        .catch(() => {
                            res.send({Error: 'Internal server error'})
                        })
                }
            })
            .catch(() => {
                res.send({Error: 'Internal server error'})
            })
    }
);


//Finding if user exists
router.get(
    '/profiles/:steamid/exists',
    function(req,res){
        User.findOne({steamid: req.params.steamid})
            .then(user => {
                if(user === null){
                    res.status(404).send({})
                }
                else{
                    res.status(200).send({})
                }
            })
            .catch(() => {
                res.send({Error: "Internal server error"})
            })
});
//Friend's account data
router.get(
    '/profiles/:steamid/profile',
    function(req,res){
       User.findOne({steamid: req.params.steamid})
           .then(user => {
               if(user === null){
                   res.status(404).send({})
               }
               else{
                    res.status(200).send({
                        steamid: user.steamid,
                        thumbnail: user.thumbnail,
                        profile_url: user.profile_url,
                        name: user.name,
                        joined: user.joined,
                        wealth: user.wealth,
                        jackpots:  user.jackpots.filter(jackpot => {
                            return jackpot.status === 'a'}
                        )
                            .map(jackpot => {
                                return jackpot.jackpot_id}
                            ),
                        multipliers: user.multipliers,
                        strikes: user.strikes,
                        jackpot_number: user.jackpots.length,
                        question_number: user.questions
                    })
               }
           })
           .catch(() => res.send({Error: "Internal server error"}))
});
//Friend's filtered timeline
router.get(
    '/profiles/:steamid/timeline',
    function(req,res){
        const allowedEvents = [
            'P',
            'M',
            'S',
            'B',
            'G'
        ];
        User.findOne({steamid: req.params.steamid})
            .then(user => {
                res.send({
                    timeline: user.general_timeline.filter(event => {
                        const eventDate = new Date(event[0]);
                        const startDate = new Date(req.query.start);
                        const finalDate = new Date(req.query.end);
                        const isAllowed = allowedEvents.includes(event[1]);
                        return (
                            (eventDate > startDate)
                            &&
                            (eventDate < finalDate)
                            &&
                            (isAllowed === true)
                        );
                    }),
                    joined: user.joined
                })
            })
            .catch(() => {
                res.send({
                    Error: 'Internal server error'
                })
            })
});



//Finding friends by name
router.get(
    '/find',
    function(req, res){
        const displayPerPage = 2;
        const offset = displayPerPage * (req.query.page-1);
        User.find({name: {"$regex": req.query.search, $options: 'i'}})
            .collation({locale: "en"})
            .sort({[req.query.sort]: req.query.order})
            .then(filteredUsers => {
                const filteredUsersCount = filteredUsers.length;
                const filteredUsersPage = filteredUsers.slice(offset, offset + displayPerPage);
                const userList = filteredUsersPage.map(user => {
                    return {
                        steamid: user.steamid,
                        name: user.name,
                        thumbnail: user.thumbnail,
                        joined: user.joined
                    }
                });
                if(req.user){
                    res.send({
                        count: filteredUsersCount,
                        profiles: userList,
                        my_name: req.user.user.name
                    });
                }
                else{
                    res.send({
                        count: filteredUsersCount,
                        profiles: userList,
                        my_name: ""
                    })
                }
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
