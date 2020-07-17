//Imports
////Local
const Jackpot = require('../../../object_db/jackpot_db.js');

//Main function
function mainGlobalJ01(req, res){
    Jackpot.findOne({jackpot_id: req.params.jackpot_id})
        .then(jackpot => {
            res.send({
                title: jackpot.jackpot_title[req.query.language],
                thumbnail: jackpot.jackpot_thumbnail,
                entity: jackpot.jackpot_entity,
                current_value: jackpot.total_value,
                current_users: jackpot.users.length,
                start: jackpot.start,
                final: jackpot.final,
                multipliers: jackpot.multipliers,
                users: jackpot.users_timetable,
                price: jackpot.price_timetable,
                score: jackpot.wealth_distribution,
                top: jackpot.top_users
            })
        })
        .catch(() => {
            res.status(505).send({Error: 'Internal server error'})
        })
}
module.exports = mainGlobalJ01;