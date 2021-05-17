//Useful functions
const modifyEvent = require('../multiplier-event-success');
const modifyUser = require('../multiplier-user-success');

//Main function
const applySilver = async(req, res, currentEvent, user, event) => {
    const [totalScore, totalValue] = await modifyEvent(event, currentEvent.score, 3 * currentEvent.score);
    const updatedUserRegister = await modifyUser(
        req, user, currentEvent, 3 * currentEvent.score, totalScore, totalValue,
        [new Date(), 'M', 'Silver', req.params.event_id],
        [new Date(), 'M', 'Silver', req.params.event_id]
    );
    res.status(200).send({eventRegister: updatedUserRegister})
}
module.exports = applySilver;