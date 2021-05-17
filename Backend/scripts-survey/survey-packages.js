//Packages
const aes256 = require('aes256');

//Local schemas
const Survey = require('../schemas/schema-survey');

//Test survey id
const testSurveyId = (surveyId) => /[a-f0-9]{24}/.test(surveyId.toLowerCase());

//Environment variables
const surveySecret = aes256.createCipher(process.env.SURVEY_KEY);

//Default package function
const defaultPackageGet = (req, res, unpackingFunction) => {
    const surveyId = req.params.surveyId;
    const language = req.query.language;
    if(testSurveyId(surveyId) === false){
        res.status(404).send({});
        return;
    }
    Survey.findOne({survey_id: surveyId})
        .then(survey => {
            if(survey === null) res.status(404).send({});
            else res.status(200).send(unpackingFunction(survey, language, req));
        })
        .catch((err) => {
            if(err instanceof CastError) res.status(404).send({});
            else res.status(500).send({});
        })
}

//Info package
const infoPackage = (survey, language, req) => {
    const {
        survey_title, survey_thumbnail, survey_header,
        survey_tier, survey_creator, survey_start,
        survey_users_number
    } = survey;
    return {
        surveyTitle: survey_title[language], surveyThumbnail: survey_thumbnail,
        surveyHeader: survey_header[language], surveyTier: survey_tier,
        surveyCreator: survey_creator, surveyStart: survey_start,
        surveyUsers: survey_users_number
    };
}

//Question package
const mainPackage = survey => {return {surveyQuestions: survey.survey_questions, surveyId: survey.survey_id}};

//Wall package
const wallPackage = survey => {return {isRestricted: survey.survey_conditions.length !== 0}};

//Reward package
const rewardPackage = (survey, language, req) => {
    const {survey_title, survey_thumbnail, survey_tier, survey_rewards} = survey;
    const surveyTitle = survey_title[language];
    const surveyReward = survey_rewards.filter(reward =>
        surveySecret.decrypt(reward.survey_reward_id) === req.user.user.steamid
    ).pop();
    if(!surveyReward) return {message: "Reward not aviable"}
    return {
        surveyTitle: surveyTitle,
        surveyThumbnail: survey_thumbnail,
        surveyTier: survey_tier,
        surveyReward: surveyReward
    }
}

//Main function
module.exports = {
    surveyInfoPackage: (req, res) => defaultPackageGet(req, res, infoPackage),
    surveyMainPackage: (req, res) => defaultPackageGet(req, res, mainPackage),
    surveyWallPackage: (req, res) => defaultPackageGet(req, res, wallPackage),
    surveyRewardPackage: (req, res) => defaultPackageGet(req, res, rewardPackage)
}