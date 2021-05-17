//Standard
import React, {useContext} from "react";

//Packages
import {Field, ErrorMessage} from "formik";

//Local components
import HoverControl from "../hover-control/survey-hover-control";
import HoverOption from "../hover-control/survey-hover-options";

//Context
import LanguageContext from "../../context/language-context";

//Main function
const SurveyAnswerOptions = ({formik, questionId, questionAnswers, questionType}) => {
    const language = useContext(LanguageContext);
    return (
        <HoverControl formik={formik} questionId={questionId} hoverField="hovering_answer_case">
            {questionAnswers.map((answer, index) =>
                <HoverOption
                    key={answer.answer_id}
                    formik={formik}
                    questionId={questionId}
                    answerId={answer.answer_id}
                    index={index}
                >
                    <Field
                        type={questionType}
                        id={answer.answer_id}
                        name={`${questionId}.answer`}
                        value={answer.answer_id}
                        checked={
                            questionType === 'checkbox'?
                                formik.values[questionId].answer.includes(answer.answer_id)
                                :
                                formik.values[questionId].answer === answer.answer_id
                        }
                        onInput={() => formik.setFieldTouched(`${questionId}.answer`, true)}
                    />
                    {answer.answer[language]}
                </HoverOption>
            )}
            <ErrorMessage name={questionId} component="div"/>
        </HoverControl>
    )
}
export default SurveyAnswerOptions;