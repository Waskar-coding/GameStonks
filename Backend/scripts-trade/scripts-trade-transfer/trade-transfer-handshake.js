//Local modules
const Event = require('../../schemas/schema-event');

//Main function
module.exports = (myUser, otherUser, handshakeEventId) => {
    let myEventRegister;
    let myEventIndex;
    myUser.events.some((register, index) => {
        if(register.event_id === handshakeEventId){
            myEventRegister = register;
            myEventIndex = index;
            return true
        }
        else return false;
    });
    return new Promise(resolve => {
        Event.findOne({event_id: handshakeEventId, active: true})
        .then(event => {
            if(event === null){
                resolve({status: 404});
                return;
            }
            return Event.findOneAndUpdate(
                { event_id: handshakeEventId, active: true },
                {
                    $push: { users: otherUser.steamid },
                    $inc: { total_score: 1.5 * myEventRegister.score }
                },
                {new: true}
            )
        })
        .then(updatedEvent => {
            if(!updatedEvent) return;
            let transferredMultiplier;
            const today = new Date();
            const myPreviousScore = myEventRegister.score;
            myUser.multipliers.some(multiplier => {
                if(multiplier.split('_')[0] === 'handshake'){
                    transferredMultiplier = multiplier;
                    return true;
                }
                else return false;
            });
            myUser.multipliers = myUser.multipliers.filter(multiplier => multiplier !== transferredMultiplier);
            myEventRegister.score = 2 * myPreviousScore;
            myEventRegister.multipliers.push(transferredMultiplier);
            myEventRegister.share_timetable.push(
                [today, myEventRegister.score / updatedEvent.total_score * updatedEvent.total_value]
            );
            myEventRegister.event_timeline.push([today, 'MJ', 'Handshaker', otherUser.name, otherUser.steamid]);
            myUser.events[myEventIndex] = myEventRegister;
            otherUser.events.push({
                event_id: updatedEvent.event_id,
                date: today,
                score: 0.5 * myPreviousScore,
                share_timetable: [[today, myPreviousScore / updatedEvent.total_score * updatedEvent.total_value]],
                event_timeline: [[today, 'PJ', 'J01'], [today, 'MJ', 'Handshaked', myUser.name, myUser.steamid]],
                multipliers: [],
                handshakes: [[today, myUser.steamid, myUser.name, myUser.thumbnail]],
                status: 'a',
                products: []
            });
            resolve({status: 200, myUser: myUser, otherUser: otherUser})
        })
        .catch((err) => { console.log(err); resolve({status: 500}) })
    });
}