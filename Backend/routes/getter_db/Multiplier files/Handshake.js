const User = require('../../object_db/user_db.js');
const Jackpot = require('../../object_db/jackpot_db.js');

function handshake(currentJackpot, req, res) {
    User.findOne({steamid: req.body.friendId})
        .then(friend => {
            if (friend === null) {
                res.send({message: `User ${req.body.friendId} not found`})
            }
            else if(friend.banned === true){
                res.send({message: `User ${req.body.friendId} is currently banned`})
            }
            else {
                const friendName = friend.name;
                const friendJackpot = friend.jackpots.filter(jackpot => {
                    return jackpot.jackpot_id === req.params.jackpot_id;
                }).pop();
                if(currentJackpot.status === 'k') {
                    res.send({message: 'Your friend was kicked from this jackpot'})
                } else {
                    applyHandshake(friendName,friendJackpot,currentJackpot, req, res).then(
                        res.send({message: 'Successful handshake'})
                    )
                }
            }
        })
}

async function applyHandshake(friendName,friendJackpot,currentJackpot,req,res){
    if(friendJackpot === undefined){
        await createRegister(req)
            .then(async () => {
                const [newUser, jackpot] = await modifyUser(req, friendName, currentJackpot);
                const isFriendUpdated = await modifyFriend(req, currentJackpot, friendJackpot, jackpot);
                if(isFriendUpdated){
                    res.send({
                        newMultipliers: newUser.multipliers,
                        newRegister: newUser.jackpots.filter(jackpot => {
                            return jackpot.jackpot_id === req.params.jackpot_id
                        }).pop()
                    })
                }}
            )
    }
    else{
        const [newUser, jackpot] = await modifyUser(req, friendName, currentJackpot);
        if(await modifyFriend(req, currentJackpot, friendJackpot, jackpot) === true){
            res.send({
                newMultipliers: newUser.multipliers,
                newRegister: newUser.jackpots.filter(jackpot => {
                    return jackpot.jackpot_id === req.params.jackpot_id
                }).pop()
            })
        }
    }
}
function createRegister(req){
    return new Promise(resolve => {
        const newRegister = {
            jackpot_id: req.params.jackpot_id,
            status: 'i',
            score: 0,
            share_timetable: [],
            date: new Date(),
            recommendations: [],
            multipliers: []
        };
        User.findOneAndUpdate(
            {steamid: req.body.friendId},
            {$push: {jackpots: newRegister}}
            )
            .then(user => {
                Jackpot.findOneAndUpdate(
                    {jackpot_id: req.params.jackpot_id},
                    {$push: {users: user.steamid}}
                    )
                    .then(() => {resolve(true)})
            })
    })
}
function modifyUser(req, friendName, currentJackpot){
    return new Promise(resolve => {
        const handshakeMultiplier = 2;
        const newScore = handshakeMultiplier * currentJackpot.score;
        Jackpot.findOneAndUpdate(
            {jackpot_id: req.params.jackpot_id},
            {
                $inc: {total_score: newScore}
            },
            {new: true}
            )
            .then(jackpot => {
                User.findOneAndUpdate(
                    {
                        steamid: req.user.user.steamid,
                        "jackpots.jackpot_id": req.params.jackpot_id
                    },
                    {
                        $set: {
                            "jackpots.$.score": newScore
                        },
                        $push: {
                            general_timeline: [
                                new Date(),
                                'M',
                                'Handshaker',
                                friendName,
                                req.body.friendId,
                                req.body.multiplier,
                                req.params.jackpot_id
                            ],
                            "jackpots.$.jackpot_timeline": [
                                new Date(),
                                'MJ',
                                'Handshaker',
                                friendName,
                                req.body.friendId,
                                req.body.multiplier
                            ],
                            "jackpots.$.multipliers": [
                                new Date(),
                                req.body.multiplier_class
                            ],
                            "jackpots.$.share_timetable": [
                                new Date(), newScore/jackpot.total_score * jackpot.total_value
                            ]
                        },
                        $pull: {
                            multipliers: req.body.multiplier
                        }
                    },
                    {new: true}
                )
                    .then(user => resolve([user, jackpot]))
            })
    });

}

function modifyFriend(req, currentJackpot, friendJackpot, jackpot){
    return new Promise(resolve => {
            User.findOneAndUpdate(
                {
                    steamid: req.body.friendId,
                    "jackpots.jackpot_id": req.params.jackpot_id
                },
                {
                    $inc: {"jackpots.$.score": Number(currentJackpot.score)},
                    $push: {
                        "general_timeline": [
                            new Date(),
                            'M',
                            'Handshaked',
                            req.user.user.name,
                            req.user.user.steamid,
                            req.body.multiplier,
                            req.user.user.jackpot_id
                        ],
                        "jackpots.$.jackpot_timeline": [
                            new Date(),
                            'MJ',
                            'Handshaked',
                            req.user.user.name,
                            req.user.user.steamid,
                            req.body.multiplier
                        ],
                        "jackpots.$.recommendations": [
                            new Date(),
                            req.user.user.steamid,
                            req.user.user.name,
                            req.user.user.thumbnail
                        ],
                        "jackpots.$.share_timetable": [
                            new Date(),
                            (friendJackpot.score + currentJackpot.score)/jackpot.total_score * jackpot.total_value
                        ]
                    },
                    $set: {"jackpots.$.status": 'a'}
                })
                .then(() => {
                    resolve(true)}
                )
    });
}
module.exports = handshake;
