//Packages
const aes256 = require('aes256');

//Local schemas
const Survey = require('../schemas/schema-survey');
const User = require('../schemas/schema-user');

//Environment variables
const surveySecret = aes256.createCipher(process.env.SURVEY_KEY);

//Update survey
const updateSurvey = (steamid, surveyId, surveyTime, surveyAnswers) => {
    const cleanSurveyAnswers = Object.entries(surveyAnswers).map(([key, value]) => {
        return {question_id: key, answer: value.answer, meta: value.meta}
    });
    return new Promise(resolve => {
        Survey.findOneAndUpdate(
            {survey_id: surveyId},
            {
                $push: {
                    survey_users: steamid,
                    survey_answers: {
                        survey_answer_id: surveySecret.encrypt(steamid),
                        survey_answer_time: surveyTime,
                        survey_answer_answers: cleanSurveyAnswers
                    }
                },
                $inc: {
                    survey_users_number: 1
                }
            }
        )
            .then(() => resolve(200))
            .catch(() => resolve(500))
    });
}

//Update user
const updateUser = (steamid, surveyId) => {
    return new Promise(resolve => {
        User.findOneAndUpdate(
            {steamid: steamid},
            {
                $push: {
                    surveys: surveyId,
                    general_timeline: Array([
                        new Date(),
                        "E",
                        "SUB",
                        surveyId
                    ])
                },
                $set: {
                    survey_date: new Date()
                },
                $inc: {
                    survey_number: 1
                }
            }
        )
            .then(() => resolve(200))
            .catch(() => resolve(500))
    })

}

//Main function
module.exports = (req, res) => {
    const {surveyId, surveyTime, surveyAnswers} = req.body;
    const {steamid, surveys} = req.user.user;
    if(surveys.includes(surveyId)){
        res.status(403).send({message: "Survey was already answered"});
        return;
    }
    Survey.findOne({survey_id: surveyId})
        .then(async survey => {
            if(survey === null) res.status(404).send({message: "Survey not found"});
            else if(survey.survey_users.includes(steamid)) res.status(403).send({message: "Already answered"});
            else if(!survey.survey_checked.includes(steamid)) res.status(403).send({message: "Not checked"})
            else{
                const userUpdateStatus = await updateUser(steamid, surveyId);
                const surveyUpdateStatus = await updateSurvey(steamid, surveyId, surveyTime, surveyAnswers);
                if((userUpdateStatus === 200) && (surveyUpdateStatus === 200)){
                    req.user.user.lastSurvey = new Date();
                    req.user.user.surveys.push(surveyId);
                    res.cookie('notify', true);
                    res.cookie('notifyType', "survey-submitted");
                    res.cookie('notifyData', "");
                    res.status(200).send({});
                }
                else res.status(500).send({message: "Internal server error, could not update"})
            }

        })
        .catch((err) => {console.log(err); res.status(500).send({message: "Internal server error, could not find survey"})})
}