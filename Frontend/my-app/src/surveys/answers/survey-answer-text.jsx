//Standard
import React from "react";

//Packages
import {ErrorMessage, Field} from "formik";

//Local components
import HoverControl from "../hover-control/survey-hover-control";

//Main function
const SurveyAnswerText = ({formik, questionId}) => {
    return (
        <HoverControl formik={formik} questionId={questionId} hoverField="hovering_answer_case" >
            <Field
                id={questionId}
                name={`${questionId}.answer`}
                onInput={() => formik.setFieldTouched(`${questionId}.answer`, true)}
            />
            <ErrorMessage name={questionId} component="div" />
        </HoverControl>
    )
}
export default SurveyAnswerText;