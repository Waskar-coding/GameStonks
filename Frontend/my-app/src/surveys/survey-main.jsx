//Standard
import React, {Fragment, useContext, useState} from "react";

//Local components
import DefaultAPIGet from "../api-interaction/default-api-get";
import DefaultAPIPost from "../api-interaction/default-api-post";
import DefaultError from "../error-components/default-error";
import SurveyInfo from "./survey-info";
import DefaultLoad from "../load-components/default-load";
import Survey from "./survey-survey";

//Useful functions
import processAction from "../language-display/process-action";
import processMessage from "../language-display/process-message";
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";
import messageDict from "../language-display/message-classifier.json";

//Context
import BasicProfileContext from "../context/profile-basic-context";
import LanguageContext from "../context/language-context";

//Main function
const WrappedSurvey = ({location}) => {
    const SURVEY_INTERVAL = 7 * 24 * 3600 * 1000;
    const surveyId = location.pathname.split('/')[2];
    const {isAuth, surveys, lastSurvey} = useContext(BasicProfileContext);
    const language = useContext(LanguageContext);

    const [creatorCheck, setCreatorCheck] = useState(false);
    const [displayCheck, setDisplayCheck] = useState(false);

    if(isAuth === false){
        return (
            <Fragment>
                <SurveyInfo surveyId={surveyId} />
                <DefaultError apiStatus={403} errorDict={{403: 'survey-auth'}} />
            </Fragment>
        )
    }
    if(surveys.includes(surveyId)){
        return(
            <Fragment>
                <SurveyInfo surveyId={surveyId} />
                <DefaultError apiStatus={403} errorDict={{403: 'survey-answered'}} />
            </Fragment>
        )
    }
    if(Date.now() - new Date(lastSurvey).getTime() < SURVEY_INTERVAL){
        return (
            <Fragment>
                <SurveyInfo surveyId={surveyId} />
                <div>
                    {processMessage(
                        language,
                        [
                            'error',
                            'survey-period',
                            lastSurvey.split('T')[0]+' '+lastSurvey.split('T')[1].slice(0,5)
                        ]
                    )}
                </div>
            </Fragment>
        )
    }
    return(
        <div>
            <SurveyInfo surveyId={surveyId} />
            {displayCheck === true &&
                <DefaultAPIPost
                    confirm={() => <div>{messageDict['confirmation']['survey-condition-confirm'][language]}</div>}
                    success={apiData => {
                        switch(apiData.status){
                            case 'success':
                                setCreatorCheck(true);
                                return <div>{messageDict['success']['survey-condition-success'][language]}</div>
                            case 'strike':
                                return(
                                    <div>
                                        <div>{messageDict['success']['survey-condition-strike'][language]}</div>
                                        <div>{processAction(language, '1st', apiData.strikeAction)[3]}</div>
                                    </div>
                                )
                            case 'server-error':
                                return <DefaultError apiStatus={500} errorDict={{500: 'survey-condition-500'}}/>
                            case 'ban':
                            default: window.location = `http://localhost:3000/surveys/${surveyId}`
                        }
                    }}
                    error={apiStatus => <DefaultError apiStatus={apiStatus} errorDict={{500: 'survey-condition-500'}}/>}
                    url={`/surveys/${surveyId}/check`}
                    requestBody={{surveyId: surveyId}}
                    loadMessage="default"
                    toParentClose={() => setDisplayCheck(false)}
                    confirmButton={interactiveDict['confirm-modal']['continue'][language]}
                    updateFunction={() => {}}
                />
            }
            {creatorCheck === true? (
                withDefaultLoadError(
                    DefaultAPIGet,
                    Survey,
                    `/surveys/${surveyId}/main?language=${language}`,
                    "survey-main",
                    {404: "survey-404", 500: "survey-500"}
                )
            ) : (
                <DefaultAPIGet
                    LoadComponent={DefaultLoad}
                    ErrorComponent={() => null}
                    url={`/surveys/${surveyId}/wall`}
                    loadMessage="survey-wall"
                    errorDict={{}}
                    render={(apiStatus, apiData) => {
                        const check = apiData.isRestricted === true;
                        return(
                            <button onClick={() => check? setDisplayCheck(true) : setCreatorCheck(true)} >
                                {interactiveDict['survey-form']['enter-survey'][language]}
                            </button>
                        )
                    }}
                />
            )}
        </div>
    )
}
export default WrappedSurvey;