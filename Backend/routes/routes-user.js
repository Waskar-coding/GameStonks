//Packages
const express = require('express');
const path = require('path');
const router = express.Router();

//Local schemas
const User = require('../schemas/schema-user.js');

//Local modules
const defaultSearch = require('../useful-functions/search');
const {generalChecking, myChecking, userChecking} = require('../scripts-user/user-checking');
const {generateDefaultUserPackage, generateTimeLine} = require("../scripts-user/user-packages");
const postDonation = require('../scripts-user/user-donation-post');
const requestChecking = require('../scripts-user/user-request-checking');
const userBasic = require('../scripts-user/user-basic');
const {userSearchFiltering, userSearchSuccess} = require('../scripts-user/user-search');
const userUpdate = require('../scripts-user/user-update');

//Local auth
const ensureAuthenticated = require('../scripts-auth/auth-ensure');
const verifyToken = require('../scripts-auth/auth-verify');

//Donate money to a friend
router.post('/donate', ensureAuthenticated, verifyToken, (req,res) => {
    const {userId, transferredWealth, dateParams, isPersonal} = req.body;
    postDonation(req, req.user.user.steamid, userId, transferredWealth, dateParams, isPersonal, res);
});

//Charge Steam account
router.post('/request', ensureAuthenticated, verifyToken, (req,res) =>
    generalChecking(req, res, req.user.user.steamid, requestChecking, userUpdate)
);

//My initial get
router.get('/my_profile', ensureAuthenticated, verifyToken, (req, res) =>
    generalChecking(req, res, req.user.user.steamid, myChecking, generateDefaultUserPackage)
);

//User initial get
router.get('/profiles/:userId/profile', (req,res) =>
    generalChecking(req, res, req.params.userId, userChecking, generateDefaultUserPackage)
);

//My timeline
router.get('/my_timeline', ensureAuthenticated, verifyToken, (req, res) =>
    generalChecking(req, res, req.user.user.steamid, myChecking, generateTimeLine)
);

//User timeline
router.get('/profiles/:userId/timeline', (req,res) =>
    generalChecking(req, res, req.params.userId, userChecking, generateTimeLine)
);

//My basic
router.get('/my_basic', ensureAuthenticated, verifyToken, async (req,res) =>
    res.status(200).send(await userBasic(req, req.user.user, true))
);

//User basic
router.get('/profiles/:userId/basic', (req,res) =>
    generalChecking(req, res, req.params.userId, userChecking, userBasic)
);

//Finding friends by name
router.get('/find', (req, res) =>
   defaultSearch(
       req, res, User, {name: {$regex: req.query.search, $options: 'i'}},
       3, userSearchFiltering, userSearchSuccess
   )
);

//Check alerts
router.get('/check_alerts', (req,res) => {
    const {notify, notifyType, notifyData} = req.cookies;
    res.clearCookie('notify');
    if(!notify) res.status(200).send({});
    else res.status(200).send({notify_type: notifyType, notify_data: notifyData});
});

//Errors
router.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html')));

module.exports = router;