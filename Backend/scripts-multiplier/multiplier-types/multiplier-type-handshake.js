//Local schemas
const User = require('../../schemas/schema-user.js');

//Useful functions
const filterEvents = require('../../useful-functions/filter-actions');
const modifyUser = require('../multiplier-user-success');
const modifyEvent = require('../multiplier-event-success');

const handshakeChecking = (req, res, currentEvent, user, event) => {
    /*
    Performs handshake multiplier specific checking, the "handshaked" user will be referred as "friend" and the
    "handshaker" as user
    */
    User.findOne({steamid: req.body.userId})
        .then(friend => {
            if (friend === null) {
                /*
                Checking if friend exists
                */
                res.status(404).send({message: `User ${req.body.userId} not found`})
            }
            else if(friend.banned === true){
                /*
                Checking if friend is banned
                */
                res.status(403).send({})
            }
            else {
                let friendEvent = friend.events.filter(event => {
                    return event.event_id === req.params.event_id;
                }).pop();
                if(friendEvent === undefined){
                    /*
                    Checking if friend is already participating in the selected event, if the friend has not entered yet
                    an event register is created and added to the register list. Then the applier function is called.
                    */
                    friendEvent = {
                        event_id: req.params.event_id, status: 'i', score: 0, share_timetable: [], handshakes: [],
                        date: new Date(), recommendations: [], multipliers: [], event_timeline: [], products: []
                    };
                    friend.events.push(friendEvent);
                    friendEvent = friend.events.filter(event => {
                        return event.event_id === req.params.event_id;
                    }).pop();
                    applyHandshake(req, currentEvent, friendEvent, user, friend, event).then(payload => {
                        res.status(200).send(payload)
                    })
                }
                else if(friendEvent.status === 'k') {
                    /*
                    Checking if friend has been kicked from the specified event
                    */
                    res.status(403).send({})
                }
                else {
                    /*
                    If friend is registered and not kicked the applier function is called
                    */
                    applyHandshake(req, currentEvent, friendEvent, user, friend, event).then(payload => {
                        res.status(200).send(payload)
                    })
                }
            }
        })
}

const applyHandshake = async(req, currentEvent, friendEvent, user, friend, event) => {
    /*
    Updated event, user, and friend, returns the users's event registers, and the friend's updated list and graph
    timelines
    */
    const {listStart, listFinal} = req.body.dateParams;
    !event.users.includes(friend.steamid) && event.users.push(friend.steamid);
    const [totalScore, totalValue] = await modifyEvent(event, currentEvent.score, 3*currentEvent.score);
    const updatedUserRegister = await modifyUser(
        req, user, currentEvent, 2*currentEvent.score, totalScore, totalValue,
        [new Date(), 'M', 'Handshaker', friend.name, req.body.userId, req.params.event_id],
        [new Date(), 'MJ', 'Handshaker', friend.name, req.body.userId]
    );
    const updatedFriend = await modifyFriend(req, friend, currentEvent, friendEvent, totalScore, totalValue);
    if(req.body.isPersonal){
        return new Promise(resolve => {resolve({eventRegister: updatedUserRegister})})
    }
    else{
        const listTimeline = await filterEvents(
            updatedFriend.general_timeline, new Date(listStart), new Date(listFinal), false
        );
        return new Promise(resolve => {resolve({
            newShare: updatedUserRegister.share_timetable[updatedUserRegister.share_timetable.length-1],
            listTimeline: listTimeline
        })})
    }
}

const modifyFriend = (req, friend, currentEvent, friendEvent, totalScore, totalValue) => {
    /*
    Adds a handshake to the general timeline and the event register's timeline, increments the score of the event
    register, adds the handshake to the event's list of handshakes, adds the new share to the share timetable and
    turns the event status to active.
    */
    const registerIndex = friend.events.indexOf(friendEvent);
    friend.general_timeline.push([
        new Date(), 'M', 'Handshaked', req.user.user.name, req.user.user.steamid, req.params.event_id
    ]);
    friend.events[registerIndex].score = friendEvent.score + currentEvent.score;
    friend.events[registerIndex].event_timeline.push([
        new Date(), 'MJ', 'Handshaker', req.user.user.name, req.user.user.steamid
    ]);
    friend.events[registerIndex].handshakes.push([
        new Date(), req.user.user.steamid, req.user.user.name, req.user.user.thumbnail
    ]);
    friend.events[registerIndex].share_timetable.push(
        [new Date(), (friendEvent.score + currentEvent.score)/totalScore * totalValue]
    );
    friend.events[registerIndex].status = 'a';
    return new Promise(resolve => {friend.save().then(newFriend => resolve(newFriend))})
}

module.exports = handshakeChecking;
