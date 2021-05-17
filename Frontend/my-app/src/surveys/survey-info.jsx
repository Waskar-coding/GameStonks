//Standard
import React, {useContext} from "react";

//Packages
import ReactHtmlParser from "react-html-parser";

//Local components
import DefaultAPIGet from "../api-interaction/default-api-get";

//Useful functions
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";

//Context
import LanguageContext from "../context/language-context";

//Wrapped main function
const WrappedSurveyInfo = ({surveyId}) => {
    const language = useContext(LanguageContext);
    return(
        <React.Fragment>
            {
                withDefaultLoadError(
                    DefaultAPIGet,
                    InnerSurveyInfo,
                    `/surveys/${surveyId}/info?language=${language}`,
                    "survey-info",
                    {404: "survey-404", 500: "survey-500"}
                )
            }
        </React.Fragment>
    )
}
export default WrappedSurveyInfo;

//Inner main function
const InnerSurveyInfo = ({state}) => {
    const {surveyTitle, surveyThumbnail, surveyHeader} = state;
    return (
        <div>
            <h1>{surveyTitle}</h1>
            <img src={surveyThumbnail} alt="survey_thumbnail" />
            <div>{ReactHtmlParser(surveyHeader)}</div>
        </div>
    )
}