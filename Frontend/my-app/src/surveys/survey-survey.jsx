//Standard
import React, {useContext, useEffect, useMemo, useReducer, useRef, useState} from "react";

//Packages
import {Formik, Form} from "formik";

//Local components
import PageList from "../search/page-list";
import {searchParamsReducer} from "../search/search-list";
import SurveyInstance from "./instances/survey-instance";
import SurveyModalsSubmit from "./modals/survey-modals-submit";

//Useful functions
import findMaxPage from "../search/max-page";
import validateSelect from "./validate/survey-validate-select";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";
import messageDict from "../language-display/message-classifier.json";

//Context
import LanguageContext from "../context/language-context";
import {SearchParams} from "../context/search-context";
import SurveyPanel from "./validate/survey-validate-panel";

//Survey
const Survey = ({state}) => {
    ////Survey general params
    const language = useContext(LanguageContext);
    const displayPerPage = 2;
    const {surveyId, surveyQuestions} = state;
    const startTime = useMemo(() => Date.now(),[]);

    ////Search params
    const [searchParams, setSearchParams] = useReducer(searchParamsReducer, {withSearch: false, page: 1});

    ////Initial values
    const initialValues = useMemo(() => surveyQuestions.reduce((initialObject, currentQuestion) => {
        const questionType = currentQuestion.question_type;
        initialObject[currentQuestion.question_id] = {
            question_type: questionType,
            question_images: questionType === 'text'? [] : currentQuestion.question_images,
            question_restrictions: questionType === 'text'? currentQuestion.question_restrictions : [],
            answer: questionType === 'checkbox'? [] : '',
            meta: {
                hovering_question: 0,
                hovering_answer_case: 0,
                hovering_answers: questionType === 'text'? 0 : currentQuestion.question_answers.map(() => 0)
            }
        };
        return initialObject;
    }, {}), [surveyQuestions]);

    ////Error cache
    const [errorCache, setErrorCache] = useState(surveyQuestions.reduce((initialObject, currentQuestion) => {
        initialObject[currentQuestion.question_id] = messageDict['error']['survey-validate-required'][language];
        return initialObject;
    },{}));

    ////Answer cache
    const [answerCache, setAnswerCache] = useState(surveyQuestions.reduce((initialObject, currentQuestion) => {
        initialObject[currentQuestion.question_id] = currentQuestion.question_type === 'checkbox'? [] : '';
        return initialObject;
    }, {}));

    ////Submit button
    const submitButton = useRef();

    ////Handle go back
    useEffect(() => window.onpopstate = () => {setSearchParams({type: "back", defaultSort: ""})}, []);

    //Current questions
    const currentQuestions = useMemo(() => {
        const currentPosition = (searchParams.page - 1) * displayPerPage;
        return surveyQuestions.slice(currentPosition, currentPosition+displayPerPage);
    },[surveyQuestions, searchParams.page, displayPerPage]);

    ////Validation function
    const validationFunction = (values) => {
        const errors = errorCache;
        if(!Object.keys(answerCache).some(key => values[key].answer !== answerCache[key])) return errors;
        currentQuestions.forEach(async currentQuestion => {
            const questionId = currentQuestion.question_id;
            const specificError = await validateSelect(values[questionId], language);
            if(specificError === '') delete errors[questionId];
            else errors[questionId] = specificError;
        });
        setTimeout(() => {
            setErrorCache(errors);
            setAnswerCache(Object.keys(values).reduce((initialObject, key) => {
                initialObject[key] = values[key].answer;
                return initialObject;
            }, {}));
            return errors;
        },50);
    }

    ////Survey post form
    const [submitObject, setSubmitObject] = useState({});

    ////Returning the form
    return(
        <div>
            <Formik
                initialValues={initialValues}
                validate={validationFunction}
                onSubmit={values => setSubmitObject(values)}
                validateOnMount={true}
                validateOnChange={true}
            >
                {formik =>{
                    return(
                        <Form>
                            <SurveyPanel
                                questionKeys={surveyQuestions.map(question => question.question_id)}
                                errors={errorCache}
                            />
                            <SearchParams.Provider
                                value={
                                    {
                                        searchParams: searchParams,
                                        setSearchParams: setSearchParams
                                    }
                                }
                            >
                                {currentQuestions.map(question =>
                                    <SurveyInstance
                                        key={question.question_id}
                                        formik={formik}
                                        question={question}
                                    />
                                )}
                                <PageList
                                    current={searchParams.page}
                                    maxPage={findMaxPage(surveyQuestions.length, displayPerPage)}
                                />
                                {Object.keys(errorCache).length !== 0 &&
                                    <div>{interactiveDict['survey-form']['tooltip-bad'][language]}</div>
                                }
                            </SearchParams.Provider>
                            <input
                                onClick={() => setTimeout(submitButton.current.blur(), 500)}
                                ref={submitButton}
                                type="submit"
                                value={interactiveDict['survey-form']['submit'][language]}
                            />
                        </Form>
                    )
                }}
            </Formik>
            {Object.keys(submitObject).length !== 0 &&
                <SurveyModalsSubmit
                    surveyId={surveyId}
                    surveyTime={Date.now() - startTime}
                    surveyAnswers={submitObject}
                    parentCancel={() => setSubmitObject({})}
                />
            }
        </div>
    )
}
export default Survey;