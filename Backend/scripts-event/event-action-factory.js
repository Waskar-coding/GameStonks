module.exports = (eventId, action, currentEvent) => {
    /*
    Event APIs will be very diverse and it is not practical fetching a different
    API at the time in the frontend. This method aims to establish an easy way
    to import specific event APIs on demand using the parameters of the current
    event and one of the established actions within an event which by today are:
        * global: Fetching global stats (public)
        * features: Fetching event's features (public)
        * post: Submitting data to the event (private)
        * personal: Fetching users event register (private)
    Private actions require auth middleware
    */
    if(currentEvent === undefined){return (req,res) => {res.status(403).send({message: "Event not accessed"})}}
    else if(currentEvent.event_id !== eventId){
        return (req, res) => {res.status(403).send({message: "Not the current event"})}
    }
    else{
        const eventClass = (currentEvent.event_class !== 'special')?
            currentEvent.event_class : currentEvent.event_id;
        return require(`./${eventClass}/event-${eventClass}-${action}`);
    }
}