//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const Event = require('../object_db/event_db.js');
const User = require('../object_db/user_db.js');



//Getting event list
router.get('/current',function(req,res){
    const active = [];
    Event.find({active: true},function(err,events){
        if(!err){
            for(let event of events){
                const eventJSON = {
                    event: {
                        event_id: event.event_id,
                        event_title: event.event_title,
                        event_entity: event.event_entity,
                        event_start: event.event_start,
                        event_end: event.event_end
                    }
                };
                active.push(eventJSON);
            }
            res.send(active);
        }
    });
});


router.get('/:event_id', function(req,res){
   ////Retrieving event
   Event.findOne({event_id: req.params.event_id}, function(err,event){
       if((err) || (event === null)){
           res.redirect('./current')
       }
       else if(!event.active){
           res.redirect('./current')
       }
       else{
           res.send({
               title: event.event_title,
               doc: event.event_doc,
               entity: event.event_entity,
               start: event.event_start,
               end: event.event_end,
               questions: event.questions
           })
       }
   })
});


router.post('/answer', function(req,res){
    Event.findOne({event_id: req.body.event_id}, function(err,event){
        if((err) || (event === null)){
            res.send({message: 'Event not found'})
        }
        else if((isNaN(req.body.answer)) || (isNaN(req.body.question_num))){
            res.send({message: 'Invalid parameters'})
        }
        else if((req.body.question_num>=event.questions.length) || (req.body.question_num<0)){
            res.send({message: 'You did not selected a valid question'})
        }
        else if(req.body.answer >= event.questions[req.body.question_num].options.length){
            console.log(event.questions[req.body.question_num].options.length);
            res.send({message: 'Your answer is not valid'})
        }
        else{
            for(let i = 0; i<event.questions[req.body.question_num].users.length; i++){
                console.log(i);
                console.log(event.questions[req.body.question_num].users.length-1);
                console.log(i === event.questions[req.body.question_num].users.length-1);
                if(event.questions[req.body.question_num].users[i] === req.body.steamid){
                    res.send({message:'You have already answered this question'});
                    break;
                }
                else if(i === event.questions[req.body.question_num].users.length-1){
                    event.questions[req.body.question_num].answers.push(req.body.answer);
                    event.questions[req.body.question_num].users.push(req.body.steamid);
                    event.markModified("questions");
                    event.save();
                    res.send({message:'Your anonymous answer has been correctly stored'});
                    break;
                }
            }
            if(event.questions[req.body.question_num].users.length<1){
                event.questions[req.body.question_num].answers.push(req.body.answer);
                event.questions[req.body.question_num].users.push(req.body.steamid);
                event.markModified("questions");
                event.save();
                res.send({message:'Your anonymous answer has been correctly stored'});
            }
        }
    })
});


router.post('/get_multiplier', function(req,res) {
    Event.find({awarded: req.body.steamid})
        .then((events) => {
            if(events.length === 0){
                return false;
            }
            for(let i = 0; i<events.length; i++){
                if(events[i].event_id === req.body.event_id){
                    return true;
                }
                else if(i === events.length-1){
                    return false;
                }
            }
        })
        .then((isAwarded) => {
            if(isAwarded){
                const message = {message: 'You were already awarded'};
                res.send(message);
                return message;
            }
            else{
                Event.findOne({event_id: req.body.event_id}, function(err,event){
                    if(err){
                        const message = {message: 'An error has occurred and you did not receive a multiplier'};
                        res.send(message);
                        return message;
                    }
                    else{
                        for(let i = 0; i<event.questions.length; i++){
                            if(event.questions[i].users.length === 0){
                                const message = {message: 'You have not answered all the questions'};
                                res.send(message);
                                return message;
                            }
                            for(let j = 0; event.questions[i].users.length; j++){
                                if(((i !== event.questions.length - 1))
                                    && (event.questions[i].users[j] === req.body.steamid)){
                                   break;
                                }
                                else if((j === event.questions[i].users.length-1)
                                    && (event.questions[i].users[j] !== req.body.steamid)){
                                    const message = {message: 'You have not answered all the questions'};
                                    console.log(`User ${req.body.steamid} not found in question ${i}`);
                                    res.send(message);
                                    return message;
                                }
                                else if((j === event.questions[i].users.length - 1)
                                    && (i === event.questions.length - 1)){
                                    User.findOneAndUpdate({steamid: req.body.steamid},{$push: {multipliers: event.event_class}},(err,user) => {
                                        console.log(user.multipliers);
                                    });
                                    console.log('Mírame, eres basura');
                                    res.send({message: `You have been awarded an ${event.event_class} multipliers`});
                                    return 'Bruh';
                                }
                            }
                        }
                    }
                })
            }
        })
        .then((message) => {
            console.log('Done');
        });
});


//Exporting method
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;