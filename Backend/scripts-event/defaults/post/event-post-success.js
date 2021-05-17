//Local schemas
const Event = require('../../../schemas/schema-event');
const Product = require('../../../schemas/schema-product');
const User = require('../../../schemas/schema-user');

//Main function
module.exports = async(
    req, res, user, product, eventId, eventClass, scoreIncrement, generalAction, eventAction, eventData
) => {
    const currentRegister = user.events.find(register => {return register.event_id === eventId});
    const updatedEvent = await new Promise((resolve, reject) => {
        Event.findOneAndUpdate({event_id: eventId},{$inc: {total_score: scoreIncrement}})
            .then(event => {resolve(event)})
            .catch(() => {
                res.status(500).send({error: 'Error while increasing event score'})
                reject(null)
            })
    });
    const newShare = updatedEvent.total_value*(currentRegister.score+scoreIncrement)/updatedEvent.total_score;
    const updatedUser = await new Promise((resolve, reject) => {
       User.findOneAndUpdate(
           {steamid: user.steamid, "events.event_id": eventId},
            {
                $inc : {"events.$.score": scoreIncrement},
                $set: {"events.$.status": "a"},
                $push: {
                    monitored: {
                        product_id: product.product_id,
                        register_date: new Date(),
                        register_type: eventClass,
                        register_data: eventData
                    },
                    general_timeline: [generalAction],
                    "events.$.event_timeline": eventAction,
                    "events.$.share_timetable": [new Date(), newShare],
                    "events.$.products": product.product_id
                },
            }, {new: true}
       )
           .then(user => resolve(user))
           .catch(() => {
               res.status(500).send({error: 'Error while modifying user register'})
               reject(null)
           })
    });
    const updatedProduct = await new Promise((resolve, reject) => {
       Product.findOneAndUpdate(
           {product_id: product.product_id, "registers.event_id": eventId},
           {$push: {"registers.$.event_users": user.steamid}}, {new: true}
       )
           .then(product => resolve(product))
           .catch(() => {
               res.status(500).send({error: 'Error while adding user to product register'})
               reject(null)
           })
    });
    if([updatedEvent, updatedUser, updatedProduct].every(updated => {return updated !==null})){
        if(!req.user.user.handshakeEvents.includes(eventId)){req.user.user.handshakeEvents.push(eventId)}
        res.status(200).send({status: 'success', newShare: newShare, productId: product.product_id});
    }
}