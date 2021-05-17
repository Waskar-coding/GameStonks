//Local schemas
const Event = require('../schemas/schema-event');
const User = require('../schemas/schema-user');

//Main function
module.exports = (req, res) => {
    /*
    Performs default checks that should be performed in every multiplier
    */
    Event.findOne({event_id: req.params.event_id})
        .then(event => {
                if(event === null){
                    /*
                    Checking if event exists
                    */
                    res.status(404).send({message: "Event not found"})
                }
                else if(event.multipliers === 0){
                    /*
                    Checking if the event allows multipliers
                    */
                    res.status(403).send({message: `Event ${req.params.event_id} does not allow multipliers`})
                }
                else{
                    const {multipliers, handshakeEvents, steamid} = req.user.user;
                    if(multipliers.includes(req.body.multiplier) && (handshakeEvents.includes(req.params.event_id))){
                        /*
                        Checking if the user has the posted multiplier and is participating in the event specified in
                        the body
                        */
                        User.findOne({steamid: steamid})
                            .then(user => {
                                const currentEvent = user.events.filter(event => {
                                    return event.event_id === req.params.event_id;
                                }).pop();
                                if(currentEvent.multipliers.length >= event.multipliers){
                                    /*
                                    Checking if the user reach the maximum multipliers allowed in the event
                                    */
                                    res.status(400).send({})
                                }
                                else{
                                    /*
                                    If the request is valid a specific function for the multiplier is dynamically
                                    imported and executed
                                    */
                                    const classFunction = require(`./multiplier-type-${req.body.multiplierClass}`);
                                    classFunction(req, res, currentEvent, user, event);
                                }
                            })
                            .catch(() => {res.status(500).send({})})
                    }
                    else{
                        res.status(404).send({
                            multiplierNotFound: !multipliers.includes(req.body.multiplier),
                            eventNotFound: !handshakeEvents.includes(req.params.event_id)
                        })
                    }
                }
            }
        )
        .catch(() => {res.status(500).send({})})
}