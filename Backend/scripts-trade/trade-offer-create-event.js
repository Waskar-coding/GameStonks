//Local schemas
const Event = require('../schemas/schema-event');
const User = require('../schemas/schema-user');

//Local modules
const checkOfferValue = require('./scripts-trade-check/trade-check-offer-value');

//Update event
const updateEvent = (eventId, myId, myName, myThumbnail, offerBody) => {
    /*
    Pushes users's offer into the event's
    list of offers in DB
    */
    const { offerTypeOut, offerValueOut, offerTypeIn, offerValueIn } = offerBody;
    const eventOffer = {
        offer_id: `${myId}_${Date.now()}`,
        offer_user_id: myId,
        offer_user_name: myName,
        offer_user_thumbnail: myThumbnail,
        offer_date: new Date(),
        offer_type_out: offerTypeOut,
        offer_value_out: offerValueOut,
        offer_type_in: offerTypeIn,
        offer_value_in: offerValueIn
    };
    return new Promise(resolve => {
        Event.findOneAndUpdate(
            {event_id: eventId},
            {
                $push: {
                    event_offers: eventOffer
                }
            }
        )
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
}

//UpdateUser
const updateUser = (eventId, myId, offerBody) => {
    /*
    Sets the users's offer into
    the user's event register
    */
    const {
        offerTypeOut, offerValueOut,
        offerTypeIn, offerValueIn
    } = offerBody;
    const today = new Date();
    const basicGeneralArray = [today, 'T',  `Offer-event-${offerTypeOut}-${offerTypeIn}`];
    const basicEventArray = [today, 'TJ',`Offer-${offerTypeOut}-${offerTypeIn}`];
    return new Promise(resolve => {
        User.findOneAndUpdate(
            {
                steamid: myId,
                "events.event_id": eventId
            },
            {
                $set: {
                    "events.$.offer": {
                        offer_id: `${myId}-${Date.now()}`,
                        offer_date: today,
                        offer_type_out: offerTypeOut,
                        offer_value_out: offerValueOut,
                        offer_type_in: offerTypeIn,
                        offer_value_in: offerValueIn
                    }
                },
                $push: {
                    "events.$.event_timeline": offerTypeOut === 'handshake'?
                        Array(...basicEventArray, offerValueIn) :
                        Array(...basicEventArray, offerValueOut, offerValueIn),
                    general_timeline: offerTypeOut === 'handshake'?
                        Array([...basicGeneralArray, eventId, offerValueIn]) :
                        Array([...basicGeneralArray, eventId, offerValueOut, offerValueIn])
                }
            }
        )
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
}

//Main function
module.exports = (req, res) => {
    /*
    Unpacking parameters
    */
    const myId = req.user.user.steamid;
    const { eventId, offerTypeOut, offerValueOut } = req.body;
    /*
    Searching for the event
    */
    Event.findOne({event_id: eventId})
    .then(event => {
        /*
        You can only post an offer per event,
        first we check if there is already an
        offer
        */
        if(event.event_offers.some(offer => offer.offer_user_id === myId)){+
            console.log('Offer already posted in this event');
            res.status(403).send({message: "Offer already posted in this event"});
            return;
        }
        /*
        Next we'll check if the user
        is registered in this event
        */
        else if(!event.users.includes(myId)){
            console.log('You are not registered in this event');
            res.status(403).send({message: "You are not registered in this event"})
            return;
        }
        /*
        All the checking regarding the event
        is now complete, next we'll check the
        user
        */
        else return User.findOne({steamid: myId});
    })
    .then(async user => {
        /*
        This is here in case the previous
        checks failed and nothing is returned
        */
        if(!user) return;
        /*
        We start by double checking if the
        user is participating in the event
        and then whether they are active
        */
        const currentEvent = user.events.filter(event => event.event_id === eventId).pop();
        if(!currentEvent){
            console.log("You are not registered in this event");
            res.status(403).send({message: "You are not registered in this event"})
            return;
        }
        else if(currentEvent.status !== 'a'){
            console.log("You are not active in this event");
            res.status(403).send({message: "You are not active in this event"})
            return;
        }
        /*
        We user checkOffer value to
        validate our offer submission
        */
        else if(await checkOfferValue(user, offerTypeOut, offerValueOut) === false){
            console.log("User does not meet the requirements for this offer");
            res.status(403).send({message: "User does not meet the requirements for this offer"})
        }
        /*
        Next both event and user are updated
        */
        else if(
            (await updateUser(eventId, myId, req.body) !== true) ||
            (await updateEvent(eventId, myId, user.name, user.thumbnail, req.body) !== true)
        ){
            console.log('Server error');
            res.status(500).send({message: "Internal server error"})
        }
        /*
        If no server errors occur
        the new offer is sent back
        */
        else res.status(200).send({offerDate: new Date(), ...req.body})
    })
    .catch(() => res.status(500).send({message: "Internal server error"}))
}