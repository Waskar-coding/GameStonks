//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const Event = require('../object_db/event_db.js');



//Getting jackpot list
router.get('/GetCurrentEvents',function(req,res){
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
                        event_end: event.event_end,
                        active: event.active
                    }
                };
                active.push(eventJSON);
            }
            res.send(active);
        }
    });
});



//Exporting method
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;