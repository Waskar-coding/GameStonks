//Standard
import React, {Fragment, lazy ,useContext, useRef, useState} from "react";

//Packages
import {Formik, Form, Field, ErrorMessage} from "formik";
import Tippy from "@tippy.js/react";

//Language jsons
import interactiveDict from "../../language-display/interactive-classifier.json";

//Context
import BasicProfileContext from "../../context/profile-basic-context";
import FunctionContext from "../../context/function-context";
import LanguageContext from "../../context/language-context";
import TransactionContext from "../../context/transaction-context";

//Dynamic imports
const UserDonationValueChecking = lazy(() => import("./user-donation-value-checking"));

//Main function
const DonationForm = () => {
    ////Context uses
    const { isAuth } = useContext(BasicProfileContext)
    const language = useContext(LanguageContext);
    const { isPersonal, userWealth, userId } = useContext(TransactionContext);

    ////Show donation confirm window
    const [display, setDisplay] = useState(0);

    ////Validation Schema
    const validateId = (value => {
        let error;
        if(!value){
            error = interactiveDict['donation-form']['validation-required'][language]
        }
        else if(isPersonal && value === userId){
            error = interactiveDict['donation-form']['validation-same-id'][language]
        }
        return error;
    });
    const validateDonationValue = (value  => {
        let error;
        if(!value){
            error = interactiveDict['donation-form']['validation-required'][language]
        }
        else if(value.includes(',')){
            error = interactiveDict['donation-form']['validation-commas'][language]
        }
        else if(isNaN(value)){
            error = interactiveDict['donation-form']['validation-number'][language]
        }
        else if(value.includes('e')){
            error = interactiveDict['donation-form']['validation-exp'][language]
        }
        else if(value <= 0){
            error = interactiveDict['donation-form']['validation-number'][language]
        }
        else if((isPersonal === true) && (value > userWealth)){
            error = interactiveDict['donation-form']['validation-wealth'][language]
        }
        else if(value.includes('.')){
            const splitNumber = value.split('.');
            if(splitNumber.length > 2){
                error = interactiveDict['donation-form']['validation-decimals'][language]
            }
            else if(splitNumber[1].length !== 2){
                error = interactiveDict['donation-form']['validation-decimals'][language]
            }
        }
        return error;
    });

    ////Submit function
    const submitButton = useRef();
    const handleSubmit = (values, onSubmitProps) => {
        submitButton.current.blur();
        setDisplay(isPersonal === true? 100 : 200);
        onSubmitProps.setSubmitting(false);
    }

    if(isAuth === false) return <div>You must be authenticated to transfer money</div>
    return (
        <Formik
            initialValues={{steamId: isPersonal === true? "" : userId, donationValue: ""}}
            validateOnMount={true}
            validateOnChange={false}
            validateOnBlur={true}
            onSubmit={handleSubmit}
        >
            {formik => {
                return(
                    <Fragment>
                        <Form>
                            {
                                isPersonal === true &&
                                    <div>
                                        <label htmlFor="steamId">
                                            {interactiveDict['donation-form']['user-id'][language]}
                                        </label>
                                        <Field
                                            name="steamId"
                                            validate={validateId}
                                            placeholder={
                                                interactiveDict['donation-form']['user-id-placeholder'][language]
                                            }
                                        />
                                        <ErrorMessage name="steamId" />
                                    </div>
                            }
                            <div>
                                <label htmlFor="donationValue">
                                    {interactiveDict['donation-form']['donation-value'][language]}
                                </label>
                                <Field
                                    name="donationValue"
                                    validate={validateDonationValue}
                                    placeholder={
                                        interactiveDict['donation-form']['donation-value-placeholder'][language]
                                    }
                                />
                                <ErrorMessage name="donationValue" />
                            </div>
                            <Tippy content={interactiveDict['donation-form']['tooltip'][language]}>
                                <input
                                    type="submit"
                                    value={interactiveDict['donation-form']['submit'][language]}
                                    ref={submitButton}
                                />
                            </Tippy>
                        </Form>
                        <FunctionContext.Provider value={(displayState) => setDisplay(displayState)}>
                            <UserDonationValueChecking donation={formik.values} display={display} />
                        </FunctionContext.Provider>
                    </Fragment>
                )
            }}
        </Formik>
    )
}
export default DonationForm;