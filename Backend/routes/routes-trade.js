//Packages
const express = require('express');
const path = require('path');
const router = express.Router();

//Local schemas
const Event = require('../schemas/schema-event');

//Local modules
const acceptOffer = require('../scripts-trade/trade-offer-accept');
const deleteOfferEvent = require('../scripts-trade/trade-offer-delete-event');
const deleteOfferProfile = require('../scripts-trade/trade-offer-delete-profile');
const fastDelete = require('../scripts-trade/trade-offer-fast-delete');
const getTradeData = require('../scripts-trade/trade-data');
const { generalChecking, myChecking, userChecking } = require('../scripts-user/user-checking');
const createOfferProfile = require('../scripts-trade/trade-offer-create-profile');
const createOfferEvent = require('../scripts-trade/trade-offer-create-event');
const { filterEventOffers, successEventOffers } = require('../scripts-trade/trade-search-event');

//Useful functions
const search = require('../useful-functions/search');

//Local auth
const ensureAuthenticated = require('../scripts-auth/auth-ensure');
const verifyToken = require('../scripts-auth/auth-verify');

//Make an offer in an event
router.post('/create_event', ensureAuthenticated, verifyToken, (req, res) => createOfferEvent(req, res));

//Make an offer to an user
router.post('/create_profile', ensureAuthenticated, verifyToken, (req, res) =>
    generalChecking(req, res, req.body.userId, userChecking, createOfferProfile)
);

//Delete an offer from and event
router.delete('/delete_event', ensureAuthenticated, verifyToken, (req, res) => deleteOfferEvent(req, res));

//Drop or decline an offer
router.delete('/delete_profile', ensureAuthenticated, verifyToken, (req, res) =>
    generalChecking(req, res, req.body.userId, userChecking, deleteOfferProfile)
);

//Fast delete an offer
router.delete('/fast_delete', ensureAuthenticated, verifyToken, (req, res) => fastDelete(req, res));

//Accept an offer
router.put('/accept', ensureAuthenticated, verifyToken, (req, res) =>
    generalChecking(req, res, req.body.userId, userChecking, acceptOffer)
);

//Get trade data
router.get('/trade_data', ensureAuthenticated, verifyToken, (req, res) => getTradeData(req, res));

//Search offers within an event
router.get('/find/:eventId', (req, res) =>
    search(
        req, res, Event,
        { event_id: req.params.eventId },
        3, filterEventOffers, successEventOffers
    )
);

//Errors
router.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html')));

module.exports = router;