//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const Jackpot = require('../object_db/jackpot_db.js');



//Getting jackpot list
router.get('/GetCurrentJackpots',function(req,res){
    const active = [];
    Jackpot.find({active: true},function(err,jackpots){
       if(!err){
           for(let jackpot of jackpots){
               const jackpotJSON = {
                   jackpot: {
                       jackpot_id: jackpot.jackpot_id,
                       jackpot_title: jackpot.jackpot_title,
                       entity: jackpot.entity,
                       jackpot_class: jackpot.jackpot_class,
                       start: jackpot.start,
                       end: jackpot.end,
                       total_value: jackpot.total_value
                   }
               };
               active.push(jackpotJSON);
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