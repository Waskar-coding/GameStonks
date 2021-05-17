//Packages
const aes256 = require('aes256');

//Local schemas
const Survey = require('../schemas/schema-survey');
const User = require('../schemas/schema-user');

//Useful functions
const generateWealthPoints = require('../useful-functions/generate-wealthpoints');
const weightedRandom = require('../useful-functions/weighted-random');
const filterActions = require('../useful-functions/filter-actions');

//Environment variables
const surveySecret = aes256.createCipher(process.env.SURVEY_KEY);

//Tier distributions
const TIER_DISTRIBUTION = {
    0: {
        "bronze": 0.00,
        "silver": 0.00,
        "golden": 0.00,
        "platinum": 0.00,
        "handshake": 0.00
    },
    1: {
        "bronze": 0.90,
        "silver": 0.10,
        "golden": 0.00,
        "platinum": 0.00,
        "handshake": 0.00
    },
    2: {
        "bronze": 0.60,
        "silver": 0.20,
        "golden": 0.10,
        "platinum": 0.00,
        "handshake": 0.10
    },
    3: {
        "bronze": 0.40,
        "silver": 0.30,
        "golden": 0.20,
        "platinum": 0.00,
        "handshake": 0.20
    },
    4: {
        "bronze": 0.20,
        "silver": 0.40,
        "golden": 0.20,
        "platinum": 0.00,
        "handshake": 0.20
    },
    5: {
        "bronze": 0.00,
        "silver": 0.35,
        "golden": 0.30,
        "platinum": 0.05,
        "handshake": 0.30
    }
}

//Update user function
const updateUser = (steamId, surveyId, multiplierClass, multiplier, timeParams) => {
    return new Promise(resolve => {
        User.findOneAndUpdate(
            {steamid: steamId},
            {
                $push: {
                    general_timeline: Array([new Date(), 'M', 'COL', multiplierClass]),
                    multipliers: multiplier
                },
                $pull: {
                    survey_rewards: surveyId
                }
            },
            {new: true}
        )
            .then(async user => {
                const {startDateList, finalDateList, startDateGraph, finalDateGraph} = timeParams;
                const {general_timeline, wealth_timetable, multipliers} = user;
                const listTl = await filterActions(
                    general_timeline, new Date(startDateList), new Date(finalDateList), true
                );
                const graphTl= await filterActions(
                    general_timeline, new Date(startDateGraph), new Date(finalDateGraph), true
                );
                const graphPts = await generateWealthPoints(
                    user.joined, new Date(startDateGraph), new Date(finalDateGraph), wealth_timetable
                );
                resolve({
                    status: 200,
                    timelineList: listTl,
                    timelineGraph: graphTl,
                    pointsGraph: graphPts,
                    multipliers: multipliers
                })
            })
            .catch(() => resolve({status: 500}))
    });
}

//Update survey
const updateSurvey = (surveyId, encryptedSteamId) => {
    return new Promise(resolve => {
       Survey.findOneAndUpdate(
           {survey_id: surveyId},
           {$pull: {survey_rewards: {survey_reward_id: encryptedSteamId}}}
       )
           .then(() => resolve(200))
           .catch(() => resolve(500))
    });
}

//Main function
module.exports = (req, res) => {
    const steamId = req.user.user.steamid;
    const surveyId = req.params.surveyId;
    const timeParams = req.body;
    Survey.findOne({survey_id: surveyId})
        .then(async survey => {
            if(survey === null){
                res.status(404).send({message: "Survey not found"});
                return;
            }
            const filteredRewards = survey.survey_rewards.filter(reward =>
                surveySecret.decrypt(reward.survey_reward_id) === steamId
            );
            if(filteredRewards.length === 1){
                const surveyReward = filteredRewards.pop();
                const surveyTier = survey.survey_tier;
                const userTier = surveyReward.survey_reward_tier;
                if((userTier > 0) && (userTier <= surveyTier)){
                    const multiplierClass = weightedRandom(TIER_DISTRIBUTION[userTier]);
                    const multiplier = `${multiplierClass}_${steamId}_${Date.now()}`;
                    const updatedUser = await updateUser(steamId, surveyId, multiplierClass, multiplier, timeParams);
                    const updatedSurveyStatus = await updateSurvey(surveyId, steamId);
                    if((updatedSurveyStatus === 200) && (updatedUser.status === 200)){
                        const { timelineList, timelineGraph, pointsGraph, multipliers } = updatedUser;
                        res.status(200).send({
                            multiplierClass: multiplierClass,
                            multipliers: multipliers,
                            timelineList: timelineList,
                            timelineGraph: timelineGraph,
                            pointsGraph: pointsGraph
                        })
                    }
                    else res.status(500).send({message: "Internal server error"})
                }
                else if(userTier === 0) res.status(403).send({message: "No reward for tier 0"});
                else res.status(400).send({message: "Impossible user tier"});
            }
            else if(filteredRewards.length === 0) res.status(403).send({message: "Not in rewards"});
            else res.status(400).send({message: "More than a reward is not possible"});
        })
        .catch(() => res.status(500).send({message: "Internal server error"}))
}