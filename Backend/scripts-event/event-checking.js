//Local schemas
const Event = require('../schemas/schema-event');

//Setting current event as cookies
const confirmEvent = (req,res) => {
    /*
    Confirms if an event exists and can be accessed by regular users
    */
    Event.findOne({event_id: req.params.event_id})
        .then(event => {
            /*
            If event is not active or does not exist a a form with an error is sent
            */
            if((event === null) || (event.active === false)){
                const currentEvent = {
                    event_id: req.params.event_id, event_final: new Date(),
                    error: (event === null)? "event-not-found" : "event-not-active"
                };
                res.cookie('currentEvent', currentEvent);
                if(event === null){res.status(404).send(currentEvent)}
                else{res.status(403).send(currentEvent)}

            }
            /*
            If the event does exist it is registered as the current event and sent
            */
            else{
                const currentEvent = {
                    event_id: event.event_id, event_title: event.event_title[req.query.language],
                    event_class: event.event_class, event_final: event.final, error: null,
                    max_multipliers: event.multipliers
                };
                res.cookie('currentEvent', currentEvent);
                res.status(200).send(currentEvent);
            }
        })
        .catch(() => {res.status(500).send({})})
}

//Main function
module.exports = (req,res) => {
    /*
    Firstly we check for the current event cookie
    */
    if(Object.keys(req.cookies).includes('currentEvent')){
        const currentEvent = req.cookies.currentEvent;
        /*
        If the cookie exists and coincides with the selected event
        the current event we'll check whether the event is finished
        or has returned and error previously. In case the event is
        finished we'll check for changes in the end date with confirmEvent
        */
        if(currentEvent.event_id === req.params.event_id){
            if((currentEvent.error === null) && (new Date(currentEvent.event_final) < new Date())){
                confirmEvent(req,res);
            }
            else{res.send(currentEvent)}
        }
        /*
        If a new event is selected it will be checked with
        confirmEvent and the cookie will be updated
        */
        else{confirmEvent(req,res);}
    }
    /*
    If the cookie does not exist the event well
    be checked and a cookie will be created
    */
    else{confirmEvent(req,res)}
}