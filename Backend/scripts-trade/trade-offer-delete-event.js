//Local schemas
const Event = require('../schemas/schema-event');
const User = require('../schemas/schema-user');

//Update event
const updateEvent = (myId, eventId) => {
    return new Promise(resolve => {
        Event.findOneAndUpdate(
            {
                event_id: eventId
            },
            {
                $pull: {
                    event_offers: {
                        offer_user_id: myId
                    }
                }
            }
        )
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })

}

//Update user
const updateUser = (myId, eventId) => {
    return new Promise(resolve => {
        User.findOneAndUpdate(
            {
                steamid: myId,
                "events.event_id": eventId
            },
            {
                $unset: {
                    "events.$.offer": ""
                },
                $push: {
                    general_timeline: Array([
                        new Date(),
                        'T',
                        'Delete-event',
                        eventId
                    ]),
                    "events.$.event_timeline": [
                        new Date(),
                        'TJ',
                        'Delete'
                    ]
                }
            },
            {new: true}
        )
        .then((user) => {console.log(user);resolve(true)})
        .catch((err) => {console.log(err);resolve(false)})
    })
}

//Main function
module.exports = async (req, res) => {
    const myId = req.user.user.steamid;
    const { eventId } = req.body;
    if(
        (await updateEvent(myId, eventId) === true) &&
        (await updateUser(myId, eventId) === true)
    ) res.status(200).send({message: `Offer deleted in event ${eventId}`})
    else res.status(500).send({message: "Internal server error"})
}