const User = require('../../object_db/user_db.js');
const Jackpot= require('../../object_db/jackpot_db.js');
function Bronze(currentJackpot, req, res){
    const bronzeMultiplier = 1.5;
    const newScore = bronzeMultiplier * currentJackpot.score;
    Jackpot.findOneAndUpdate(
        {
            jackpot_id: req.params.jackpot_id
        },
        {
            $inc: {total_score: newScore - currentJackpot.score}
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
                $set: {"jackpots.$.score": newScore},
                $push: {
                    "jackpots.$.multipliers": [new Date(), req.body.multiplier_class],
                    "jackpots.$.share_timetable": [new Date(), newScore/jackpot.total_score*jackpot.total_value]
                },
                $pull: {multipliers: req.body.multiplier}
            }, {new: true}
        )
            .then(user => {
                res.send({user: user, new_share: newScore/jackpot.total_score*jackpot.total_value})
            })
        })
}
module.exports = Bronze;