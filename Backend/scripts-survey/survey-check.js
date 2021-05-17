//Local schemas
const Survey = require('../schemas/schema-survey');

//Local modules
const surveyBan = require('./survey-ban');
const surveyStrike = require('./survey-strike');

//Test survey id
const testSurveyId = (surveyId) => /[a-f0-9]{24}/.test(surveyId.toLowerCase());

//Main function
module.exports = (req, res) => {
    const steamId = req.user.user.steamid;
    const surveyId = req.params.surveyId;
    if(testSurveyId(surveyId) === false){
        res.status(404).send({message: "Survey not found"});
        return;
    }
    if(req.user.user.surveys.includes(surveyId)){
        res.status(403).send({message: "Survey already answered"});
        return;
    }
    Survey.findOne({survey_id: surveyId})
        .then(async survey => {
            if(survey === null){
                res.status(404).send({message: "Survey not found"});
                return;
            }
            if(survey.survey_checked.includes(steamId)){
                res.status(200).send({status: 'success'});
                return;
            }
            let conditionFunction;
            let conditionResponse;
            const surveyResponse = survey.survey_conditions.reduce(async (currentResponse, condition) => {
                currentResponse = await currentResponse;
                if (
                    (currentResponse.status !== 'success') &&
                    (currentResponse.status !== 'server-error') &&
                    (currentResponse.status !== 'init')
                ) return currentResponse;
                conditionFunction = require(`./survey-conditions/survey-condition-${condition[0]}`);
                conditionResponse = await conditionFunction(req, surveyId, condition);
                console.log(`Condition response: ${JSON.stringify(conditionResponse)}`);
                switch (conditionResponse.status) {
                    case 'strike': return await surveyStrike(steamId, conditionResponse);
                    case 'ban': return await surveyBan(steamId, conditionResponse);
                    default: return conditionResponse;
                }
            }, {status: 'init'});
            const resolvedSurveyResponse = await surveyResponse;
            console.log(resolvedSurveyResponse);
            if (resolvedSurveyResponse.status === 'ban') {
                const {banAction, banRegister} = resolvedSurveyResponse;
                req.logout();
                res.cookie('notify', true);
                res.cookie('notifyType', banRegister.ban_type);
                res.cookie('notifyData', {action: banAction, register: banRegister});
            }
            if(resolvedSurveyResponse.status !== 'success'){
                console.log(resolvedSurveyResponse.status);
                res.status(200).send(resolvedSurveyResponse);
                return;
            }
            Survey.findOneAndUpdate({survey_id: surveyId},{$push: {survey_checked: steamId}})
                .then(async () => res.status(200).send(resolvedSurveyResponse))
                .catch(() => res.status(500).send({message: "Internal server error"}))
        })
        .catch(() => res.status(500).send({}))
}