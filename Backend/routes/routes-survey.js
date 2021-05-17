//Packages
const express = require('express');
const router = express.Router();

//Local schemas
const Survey = require('../schemas/schema-survey');

//Local modules
const surveyCheck = require('../scripts-survey/survey-check');
const {
    surveyInfoPackage, surveyMainPackage,
    surveyWallPackage, surveyRewardPackage
} = require('../scripts-survey/survey-packages');
const surveyPost = require('../scripts-survey/survey-post');
const surveyReward = require('../scripts-survey/survey-reward');
const {surveySearchFiltering, surveySearchSuccess} = require('../scripts-survey/survey-search');
const defaultSearch = require('../useful-functions/search');

//Local auth
const ensureAuthenticated = require('../scripts-auth/auth-ensure');
const verifyToken = require('../scripts-auth/auth-verify');

//Post survey answers
router.post('/:surveyId/post', ensureAuthenticated, verifyToken, (req, res) => surveyPost(req, res));

//Reward user
router.post('/:surveyId/reward_post', ensureAuthenticated, verifyToken, (req, res) => surveyReward(req, res));

//Check survey
router.post('/:surveyId/check', ensureAuthenticated, verifyToken, (req, res) => surveyCheck(req, res));

//Get survey headers
router.get('/:surveyId/info', (req, res) => surveyInfoPackage(req, res));

//Get survey questions
router.get('/:surveyId/main', ensureAuthenticated, verifyToken, (req, res) => surveyMainPackage(req, res));

//Get survey restrictions
router.get('/:surveyId/wall', ensureAuthenticated, verifyToken, (req, res) => surveyWallPackage(req, res));

//Get reward information
router.get('/:surveyId/reward_get', ensureAuthenticated, verifyToken, (req, res) => surveyRewardPackage(req, res));

//Find surveys
router.get('/find', (req, res) =>
    defaultSearch(
        req, res, Survey, {survey_active: true},
        2, surveySearchFiltering, surveySearchSuccess
    )
);

//Main function
module.exports = router;