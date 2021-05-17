//Standard
import React, {useContext} from "react";

//Packages
import { Field, ErrorMessage } from "formik";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";

//Context
import LanguageContext from "../context/language-context";

//Main function
const TradeValue = ({tradeData, tradeType, fieldName}) => {
    /*
    Unpacking context
    */
    const language = useContext(LanguageContext);
    /*
    Validation function
    for cash  input
    */
    const validateCash = value  => {
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
    }
    /*
    Returning inputs depending
    on item type
    */
    switch(tradeType){
        case "cash":
            return(
                <>
                    <Field validate={validateCash} name={fieldName} />
                    <ErrorMessage name={fieldName} />
                </>
            )
        case "multiplier":
            let multiplierClass;
            const multiplierClasses = tradeData.multipliers.reduce((currentList, multiplier) => {
                multiplierClass = multiplier.split('_')[0];
                if(!currentList.includes(multiplierClass)){ currentList.push(multiplierClass) }
                return currentList;
            },[]);
            return(
                <Field as="select" name={fieldName}>
                    {multiplierClasses.map(multiplier =>
                        <option key={`${fieldName}_${multiplier}`} value={multiplier}>
                            {multiplier}
                        </option>
                    )}
                </Field>
            )
        default:
            return(
                <Field as="select" name={fieldName}>
                    {tradeData.handshakeEvents.map(eventId =>
                        <option key={`${fieldName}_${eventId}`} value={eventId}>
                            {eventId}
                        </option>
                    )}
                </Field>
            )
    }
}
export default TradeValue;