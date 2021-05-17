//Standard
import React, {useContext, useState} from "react";

//Local components
import DefaultAPIGet from "../../api-interaction/default-api-get";
import DefaultAPIPost from "../../api-interaction/default-api-post";

//Useful functions
import withDefaultLoadError from "../../api-interaction/with-default-load-&-error";

//Language jsons
import interactiveDict from "../../language-display/interactive-classifier.json";

//Context
import LanguageContext from "../../context/language-context";
import TransactionContext from "../../context/transaction-context";

//Main function
const RewardList = () => {
    const language = useContext(LanguageContext);
    const { profile, setProfile, list, setList, graph, setGraph } = useContext(TransactionContext);
    const [reward, setReward] = useState(null);
    return (
        <div>
            <h1>Reward</h1>
            <div>
                <ul>
                    {profile.rewards.map(surveyId =>
                        <li key={surveyId}>
                            <div>{surveyId}</div>
                            <button onClick={() => setReward(surveyId)} >
                                Cash in
                            </button>
                        </li>
                    )}
                </ul>
            </div>
            {reward !== null &&
                <DefaultAPIPost
                    confirm={() => {
                        return(
                            withDefaultLoadError(
                                DefaultAPIGet,
                                RewardInfo,
                                `/surveys/${reward}/reward_get?language=${language}`,
                                "default",
                                {500: "survey-reward-500", 404: "survey-reward-404"}
                            )
                        )
                    }}
                    success={(apiData) => {
                        const {multiplierClass} = apiData;
                        return(
                            <div>{multiplierClass}</div>
                        )
                    }}
                    error={{500: "survey-reward-500", 404: "survey-reward-404", 403: "survey-reward-403"}}
                    url={`/surveys/${reward}/reward_post`}
                    requestBody={
                        {
                            startDateList: list.startDate,
                            finalDateList: list.finalDate,
                            startDateGraph: graph.startDate,
                            finalDateGraph: graph.finalDate
                        }}
                    loadMessage="default"
                    toParentClose={() => setReward(null)}
                    confirmButton={interactiveDict['confirm-modal']['continue'][language]}
                    updateFunction={(apiData) => {
                        const {multipliers, timelineList, timelineGraph, pointsGraph} = apiData
                        setProfile({...profile, multipliers: multipliers});
                        setList({...list, timeline: timelineList});
                        setGraph({...graph, timeline: timelineGraph, wealthPoints: pointsGraph});
                    }}
                />
            }
        </div>
    )
}
export default RewardList;

//Reward info
const RewardInfo = ({state}) => {
    const {surveyTitle, surveyThumbnail, surveyTier, surveyReward} = state;
    const rewardTier = surveyReward.survey_reward_tier;
    return(
        <div>
            <h1>{surveyTitle}</h1>
            <img src={surveyThumbnail} alt="survey_thumbnail" />
            <div>
                <h2>Survey tier</h2>
                <p>{surveyTier}</p>
            </div>
            <div>
                <h2>Reward tier</h2>
                <p>{rewardTier}</p>
            </div>
            {Number(surveyTier) !== Number(rewardTier) &&
                <div>{surveyReward.survey_reward_message}</div>
            }
        </div>
    )
}