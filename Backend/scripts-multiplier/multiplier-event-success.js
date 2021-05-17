module.exports = (event, oldScore, newScore) => {
    /*
    Increments the event's score and saves it, returns a list with the new total score and the total value
    */
    event.total_score = event.total_score - oldScore + newScore;
    return new Promise(resolve => {event.save().then(newevent => resolve([
        newevent.total_score, newevent.total_value
    ]))})
}