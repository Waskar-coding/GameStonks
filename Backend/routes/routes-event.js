//Packages
const express = require('express');
const path = require('path');
const router = express.Router();

//Local schemas
const Event = require('../schemas/schema-event.js');

//Local modules
const defaultSearch = require('../useful-functions/search');
const eventActionFactory = require('../scripts-event/event-action-factory');
const eventChecking = require('../scripts-event/event-checking');
const {eventSearchFiltering, eventSearchSuccess} = require('../scripts-event/event-search');
const multiplierChecking = require('../scripts-multiplier/multiplier-checking');

//Local auth
const ensureAuthenticated = require('../scripts-auth/auth-ensure');
const verifyToken = require('../scripts-auth/auth-verify');

//Current events
router.get('/find', (req,res) => {
    defaultSearch(req, res, Event, {active: true},2, eventSearchFiltering, eventSearchSuccess)
});

//Event confirm
router.get('/:event_id/active', (req,res) => {eventChecking(req,res)});

//Event public get
router.get('/:event_id/public/:action', (req,res) => {
    eventActionFactory(req.params.event_id, req.params.action, req.cookies.currentEvent)(req, res);
});

//Event private get
router.get('/:event_id/private/:action', ensureAuthenticated, verifyToken, (req,res) => {
    eventActionFactory(req.params.event_id, req.params.action, req.cookies.currentEvent)(req, res);
});

//Event private post
router.post('/:event_id/private/:action', ensureAuthenticated, verifyToken, (req,res) => {
    eventActionFactory(req.params.event_id, req.params.action, req.cookies.currentEvent)(req, res);
});

////Multipliers
router.post('/:event_id/multiplier', ensureAuthenticated, verifyToken, (req,res) => {multiplierChecking(req,res)});

//Errors
router.get('*', (req, res) => {res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));});

module.exports = router;
