//Local schemas
const User = require('../schemas/schema-user');

//User event registers
const getUserRegister = (userId) => {
    /*
    Gets all user's event registers in which user's state is active (a) or kicked (k).
    */
    return new Promise((resolve) => {
        User.findOne({steamid: userId})
                .then(user => {resolve(user.events.filter(event =>{return ['a','k'].includes(event.status);}))})
    })
};

//Exported functions
module.exports = {
    eventSearchFiltering: (req, searchResults) => {return new Promise(resolve => {
        /*
        Filters event searchResults using the parameter search in req.query, only events with the search parameter on
        their title or entity (determine by language in req.query) pass the filter.
        */
        const search = new RegExp(req.query.search,'i');
        resolve(searchResults.filter(event => {
            return((search.test(event['event_title'][req.query.language])||(search.test(event['event_entity']))))
        }))
    })},
    eventSearchSuccess: async (req, count, newSearchResults) => {
        /*
        Formats the filtered searchResults so they are easy process by the frontend, it compares them with the user
        registers obtained using getUserRegister (in case user has authenticated) in order to determine user's status
        within every event.
        */
        const currentEvents = newSearchResults.map(event => {return ({
            eventId: event.event_id, title: event.event_title[req.query.language],
            class: event.event_class, thumbnail: event.event_thumbnail, sponsor: event.event_entity,
            start: event.start, final: event.final, value: event.total_value, users: event.users.length, status: 'i'
        })});
        const registers = req.user !== undefined? await getUserRegister(req.user.user.steamid) : [];
        const registerIds = registers.map(register => {return register.event_id});
        return new Promise(resolve => {resolve({
            current_n: count, isAuth: req.user !== undefined,
            items: registers.length === 0?
                currentEvents : currentEvents.map(event => {
                    const eventIndex = registerIds.indexOf(event.eventId);
                    if(eventIndex !== -1){event.status = registers[eventIndex].status}
                    return event
        })})})
    }

}