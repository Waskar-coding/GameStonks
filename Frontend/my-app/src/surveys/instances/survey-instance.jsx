//Standard
import React from "react";

//Local components
import SurveyAnswerOptions from "../answers/survey-answer-options";
import SurveyAnswerText from "../answers/survey-answer-text";
import SurveyQuestion from "../questions/survey-question";

//Main function
const SurveyInstance = ({formik, question}) => {
    return(
        <div>
            <SurveyQuestion formik={formik} questionId={question.question_id} question={question.question} />
            <SurveyAnswer formik={formik} question={question} />
        </div>
    )
}
export default SurveyInstance;

//Survey Answer
const SurveyAnswer = ({formik, question}) => {
    const questionId = question.question_id;
    switch (question.question_type) {
        case "checkbox":
        case "radio":
            return(
                <SurveyAnswerOptions
                    formik={formik}
                    questionId={questionId}
                    questionAnswers={question.question_answers}
                    questionType={question.question_type}
                />
            )
        case "text":
            return (
                <SurveyAnswerText
                    formik={formik}
                    questionId={questionId}
                />
            )
        default: return null
    }
}