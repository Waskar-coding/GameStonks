//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const Info = require('../object_db/info_db.js');

//Getting a text by id
router.get('/:id',function(req,res){
    Info.findOne({text_id:req.params.text_id})
        .then(infoText => {
            res.send({
                description: infoText.description,
                language: infoText.language,
                tags: infoText.tags
            })
        })
});

//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;