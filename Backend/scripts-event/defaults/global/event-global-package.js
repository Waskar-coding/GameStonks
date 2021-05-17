//Local schemas
const Event = require('../../../schemas/schema-event');

//Main function
module.exports = (req, res) => {
        Event.findOne({event_id: req.params.event_id})
        .then(event => {
            res.send({
                title: event.event_title[req.query.language],
                thumbnail: event.event_thumbnail,
                entity: event.event_entity,
                value: event.total_value,
                userNumber: event.users.length,
                start: event.start,
                final: event.final,
                multipliers: event.multipliers,
                users: event.users_timetable,
                price: event.price_timetable,
                score: event.wealth_distribution,
                top: event.top_users
            })
        })
        .catch(() => {res.status(500).send({Error: 'Internal server error'})})
}