const User = require('../../object_db/user_db.js');
const Jackpot = require('../../object_db/jackpot_db.js');

function handshake(currentJackpot, req, res) {
    User.findOne({name: req.body.friendName})
        .then(friend => {
            if (friend === null) {
                res.send({message: `User ${req.body.friendName} not found`})
            }
            else if(friend.banned === true){
                res.send({message: `User ${req.body.friendName} is currently banned`})
            }
            else {
                const friendJackpot = friend.jackpots.filter(jackpot => {
                    return jackpot.jackpot_id === req.params.jackpot_id;
                }).pop();
                if(currentJackpot.status === 'k') {
                    res.send({message: 'Your friend was kicked from this jackpot'})
                } else {
                    applyHandshake(friendJackpot,currentJackpot, req, res)
                }
            }
        })
}

async function applyHandshake(friendJackpot,currentJackpot,req,res){
    if(friendJackpot === undefined){
        await createRegister(req)
            .then(async isCreated => {
                const [newUser, jackpot] = await modifyUser(req, currentJackpot);
                const isFriendUpdated = await modifyFriend(req, currentJackpot, friendJackpot, jackpot);
                if(isFriendUpdated){
                    res.send({user: newUser})
                }}
            )
    }
    else{
        const [newUser, jackpot] = await modifyUser(req, currentJackpot);
        if(await modifyFriend(req, currentJackpot, friendJackpot, jackpot) === true){
            res.send({user: newUser})
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
            {name: req.body.friendName},
            {$push: {jackpots: newRegister}}
            )
            .then(user => {
                Jackpot.findOneAndUpdate(
                    {jackpot_id: req.params.jackpot_id},
                    {$push: {users: user.steamid}}
                    )
                    .then(jackpot => {resolve(true)})
            })
    })
}
function modifyUser(req, currentJackpot){
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
                    {steamid: req.user.user.steamid, "jackpots.jackpot_id": req.params.jackpot_id},
                    {
                        $set: {"jackpots.$.score": newScore},
                        $push: {
                            "jackpots.$.multipliers": [new Date(), req.body.multiplier_class],
                            "jackpots.$.share_timetable": [new Date(), newScore/jackpot.total_score * jackpot.total_value]
                        },
                        $pull: {multipliers: req.body.multiplier}
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
                    name: req.body.friendName,
                    "jackpots.jackpot_id": req.params.jackpot_id
                },
                {
                    $inc: {"jackpots.$.score": Number(currentJackpot.score)},
                    $push: {
                        'jackpots.$.recommendations': [new Date(), req.user.user.steamid],
                        "jackpots.$.share_timetable": [new Date(), (friendJackpot.score + currentJackpot.score)/jackpot.total_score * jackpot.total_value]
                    },
                    $set: {"jackpots.$.status": 'a'}
                })
                .then(user => {
                    resolve(true)}
                )
    });
}
module.exports = handshake;