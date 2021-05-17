//Standard
import React, {useContext} from "react";

//Packages
import ReactHtmlParser from "react-html-parser";

//Local components
import HoverControl from "../hover-control/survey-hover-control";

//Context
import LanguageContext from "../../context/language-context";

//Main function
const SurveyQuestion = ({formik, questionId, question}) => {
    const language = useContext(LanguageContext);
    return(
        <HoverControl formik={formik} questionId={questionId} hoverField="hovering_question">
            {ReactHtmlParser(question[language])}
        </HoverControl>
    )
}
export default SurveyQuestion;