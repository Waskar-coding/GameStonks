module.exports = (req, user, currentEvent, newScore, totalScore, totalValue, generalAction, eventAction) => {
    /*
    Pulls the specified multiplier in the request from the user's multiplier list, adds the handshake to the
    general_timeline and the event timeline, increments the score of the event register, adds a new share to its share
    timetable and adds the multiplier to its multiplier field.
    */
    const registerIndex = user.events.indexOf(currentEvent);
    req.user.user.multipliers = req.user.user.multipliers.filter(reqM => {return reqM !== req.body.multiplier});
    user.multipliers = user.multipliers.filter(userM => {return userM !== req.body.multiplier});
    user.general_timeline.push(generalAction);
    user.events[registerIndex].score = newScore;
    user.events[registerIndex].event_timeline.push(eventAction);
    user.events[registerIndex].share_timetable.push([new Date(), newScore / totalScore * totalValue]);
    user.events[registerIndex].multipliers.push(req.body.multiplier);
    return new Promise(resolve => {user.save().then(newUser => resolve(newUser.events[registerIndex]))});
}