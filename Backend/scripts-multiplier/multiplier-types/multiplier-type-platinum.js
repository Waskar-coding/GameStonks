//Useful functions
const modifyEvent = require('../multiplier-event-success');
const modifyUser = require('../multiplier-user-success');

//Main function
const applyPlatinum = async(req, res, currentEvent, user, event) => {
    const [totalScore, totalValue] = await modifyEvent(event, currentEvent.score, 50 * currentEvent.score);
    const updatedUserRegister = await modifyUser(
        req, user, currentEvent, 50 * currentEvent.score, totalScore, totalValue,
        [new Date(), 'M', 'Platinum', req.params.event_id],
        [new Date(), 'M', 'Platinum', req.params.event_id]
    );
    res.status(200).send({eventRegister: updatedUserRegister})
}
module.exports = applyPlatinum;