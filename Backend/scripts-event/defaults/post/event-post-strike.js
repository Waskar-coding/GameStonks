//Local schemas
const User = require('../../../schemas/schema-user');

//Useful functions
const banUser = require('./event-post-ban');

//Main function
module.exports = (
    req, res, user, product,
    generalAction,eventAction,
    strikeRegister, eventId
) => {
    /*
    Unpacking
    */
    const myId = req.user.user.steamid;
    /*
    Firstly if the user has posted
    and offer in the event it is
    eliminated as well as the user's
    id from the event's user list
    */
    Event.findOneAndUpdate(
        {
            event_id: eventId,
            "event_offers.offer_user_id": myId
        },
        {
            $pull: {
                "event_offers.$.offer_user_id": myId,
                "users": myId
            }
        }
    )
    .then(() => {
        /*
        Secondly the user profile in DB
        is updated, a strike is added to
        the register, a strike event is
        added to the timeline, and the
        event status is set to k in the
        DB profile's event register
        */
        return User.findOneAndUpdate(
        {
            steamid: myId,
            "events.event_id": eventId
        },
        {
                $push: {
                    strikes: strikeRegister,
                    general_timeline: [generalAction],
                    "events.$.event_timeline": eventAction
                },
                $set: {
                    "events.$.status": 'k'
                }
            },
            {
                new: true
            }
        )
    })
    .catch(() =>
        res.status(500).send({
            message: `Internal server error, failed to update offers in event ${eventId}`
        })
    )
    .then(user => {
        /*
        If the users has 3 strikes or more
        the ban parameters are set and the
        user is banned for strike accumulation
        */
        if(user.strikes.length > 2){
            const now = Date.now();
            const banStart = new Date(now);
            const banFinal = new Date(now + 2592000000);
            const banRegister = {
                ban_date: banStart,
                ban_type: 'B02',
                ban_end: banFinal, ban_data: []
            }
            banUser(req, res, user, [banStart, 'B', 'B02-A'], banRegister);
        }
        /*
        If the user has less than 3 strikes
        the notification cookies are set to
        warn the user of the new strike when
        the page is refreshed. And the number
        of strikes is sent through the package
        */
        else{
            res.cookie('notify', true);
            res.cookie('notifyType', `strike`);
            res.cookie('notifyData', {
                action: eventAction,
                register: strikeRegister,
                currentStrikes: user.strikes.length
            });
            req.user.user.handshakeEvents = req.user.user.handshakeEvents.filter(event =>  event !== eventId);
            res.status(200).send({
                status: 'kicked',
                strikeNum: user.strikes.length
            })
        }
    })
    .catch(() => {res.status(500).send({message: `Error while striking user ${user.steamid}`})})
}