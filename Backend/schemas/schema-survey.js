//Packages
const mongoose = require('mongoose');

const SurveyAnswer = mongoose.Schema({
    survey_answer_id: String,
    survey_answer_time: {type: Number},
    survey_answer_answers: Object
});

const SurveyReward = mongoose.Schema({
   survey_reward_id: String,
   survey_reward_tier: {type: Number},
   survey_reward_message: String
});

//Survey schema
const survey = mongoose.Schema({
    survey_id: mongoose.Schema.Types.ObjectId,
    survey_active: Boolean,
    survey_score: {type: Number},
    survey_tier: {type: Number},
    survey_creator: String,
    survey_thumbnail: String,
    survey_title: Object,
    survey_start: Date,
    survey_final: Date,
    survey_users: Array,
    survey_checked: Array,
    survey_users_number: {type: Number},
    survey_header: Object,
    survey_questions: Array,
    survey_conditions: Array,
    survey_answers: [SurveyAnswer],
    survey_rewards: [SurveyReward]
});
const Survey = mongoose.model('Survey', survey);
module.exports = Survey;