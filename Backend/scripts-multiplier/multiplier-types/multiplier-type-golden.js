//Useful functions
const modifyEvent = require('../multiplier-event-success');
const modifyUser = require('../multiplier-user-success');

//Main function
const applyGolden = async(req, res, currentEvent, user, event) => {
    const [totalScore, totalValue] = await modifyEvent(event, currentEvent.score, 10 * currentEvent.score);
    const updatedUserRegister = await modifyUser(
        req, user, currentEvent, 10 * currentEvent.score, totalScore, totalValue,
        [new Date(), 'M', 'Golden', req.params.event_id],
        [new Date(), 'M', 'Golden', req.params.event_id]
    );
    res.status(200).send({eventRegister: updatedUserRegister})
}
module.exports = applyGolden;