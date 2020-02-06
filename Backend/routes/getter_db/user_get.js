//Libraries
////Packages
const express = require('express');
const router = express.Router();
const path = require('path');

////Local
const User = require('../object_db/user_db.js');
const steamAuth = require('../steam_auth/auth');
const localAuth = require('../local_auth/verify');



//Getting getting user account data
router.get('/my_profile/',steamAuth.ensureAuthenticated, localAuth.verifyToken,function(req, res){
    res.send(req.user.user);
});



//Getting other users data
router.get('/:steamid',function(req, res){
    User.findOne({steamid: req.params.steamid},function (err, user) {
        if(!err){
            const userJSON = {
                steamuser: {
                    steamid: user.steamid,
                    name: user.name,
                    joined: user.joined.toISOString().substring(0, 10),
                    thumbnail: user.thumbnail,
                    prizes: user.prizes,
                    banned: user.banned
                }
            };
            console.log(user);
            res.send(userJSON)
        }
    })
});



//Finding user by name
router.get('/find_user/:username', function(req, res){
    const userList = [];
    User.find({name: {"$regex": req.params.username, $options: 'i'}},function (err, users) {
        if(!err){
            for (const user of users) {
                const userJSON = {
                    steamuser: {
                        name: user.name,
                        thumbnail: user.thumbnail,
                    }
                };
                userList.push(userJSON)
            }
            res.send(userList)
        }
        console.log(userList);
    })
});



//Errors
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
