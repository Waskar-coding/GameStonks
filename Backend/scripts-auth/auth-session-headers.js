//Main function
module.exports = user => {
    const {steamid, name, thumbnail, multipliers, banned, surveys, survey_date} = user;
    const handshakeEvents = user.events.filter(eventRegister => {
        return eventRegister.status === 'a' && eventRegister.products.length > 0
    }).map(filteredEventRegister => filteredEventRegister.event_id);
    return {
        steamid: steamid, name: name, thumbnail: thumbnail,
        multipliers: multipliers, handshakeEvents: handshakeEvents,
        banned: banned, surveys: surveys, lastSurvey: survey_date
    }
}