module.exports = (req, eventId, action, currentEvent) => {
    /*
    Cookieless version of event-action-factory, used for testing pusposes
    */
    const eventClass = req.params.event_id.split('_')[0];
    return require(`./${eventClass}/event-${eventClass}-${action}`);
}