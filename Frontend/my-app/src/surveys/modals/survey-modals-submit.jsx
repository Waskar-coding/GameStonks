//Standard
import React, {useContext} from "react";

//Local components
import DefaultAPIPost from "../../api-interaction/default-api-post";
import DefaultError from "../../error-components/default-error";

//Language jsons
import interactiveDict from "../../language-display/interactive-classifier.json";
import messageDict from "../../language-display/message-classifier.json";

//Context
import LanguageContext from "../../context/language-context";

//Main function
const SurveyModalsSubmit = ({surveyId, surveyTime, surveyAnswers, parentCancel}) => {
    const language = useContext(LanguageContext);
    return (
        <DefaultAPIPost
            confirm={() => <div>{messageDict['confirmation']['survey-submit-confirm'][language]}</div>}
            success={() => {
                window.location = `http://localhost:3000/surveys/${surveyId}`;
                return <div>{messageDict['success']['survey-submit-success'][language]}</div>
            }}
            error={(apiStatus) => <DefaultError apiStatus={apiStatus} errorDict={{500: "survey-submit-500"}}/>}
            url={`/surveys/${surveyId}/post`}
            requestBody={{surveyId: surveyId, surveyTime: surveyTime, surveyAnswers: surveyAnswers}}
            loadMessage="survey-submit"
            toParentClose={() => parentCancel()}
            confirmButton={interactiveDict['survey-form']['confirm'][language]}
            updateFunction={() => {}}
        />
    )
}
export default SurveyModalsSubmit;