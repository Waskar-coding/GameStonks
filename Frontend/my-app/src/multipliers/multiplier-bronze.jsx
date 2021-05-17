//Standard
import React, {useContext} from "react";

//Local components
import DefaultAPIPost from "../api-interaction/default-api-post";
import DefaultError from "../error-components/default-error";

//Useful functions
import configMoneyDisplay from "../data-manipulation/config-money-display";
import processMessage from '../language-display/process-message';
import multiplierUpdate from "./multiplier-update";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";

//Context
import FunctionContext from "../context/function-context";
import LanguageContext from '../context/language-context';
import MultiplierContext from "../context/multiplier-context";

//Main function
const MultiplierBronze = ({multiplier}) => {
    const language = useContext(LanguageContext);
    const multiplierContext = useContext(MultiplierContext);
    const {eventId, userId} = multiplierContext;
    const closeFunction = useContext(FunctionContext);
    const requestBody = {
        userId: userId, multiplier: multiplier, eventId: eventId, multiplierClass: "bronze",
        dateParams:{}, isPersonal: true
    }
    return(
        <DefaultAPIPost
            confirm={() => {
                const confirmMessage = processMessage(language, ["confirmation","bronze-confirm", eventId]);
                return(<div>{confirmMessage}</div>)
            }}
            success={apiData => {
                const shareTimetable = apiData.eventRegister.share_timetable;
                const share = configMoneyDisplay(shareTimetable[shareTimetable.length-1][1]);
                const successMessage= processMessage(language, ["success", "bronze-success", share]);
                return(<div>{successMessage}</div>)
            }}
            error={apiStatus => {return(<DefaultError apiStatus={apiStatus} errorDict={{500: "multipliers-500"}}/>)}}
            url={`/events/${eventId}/multiplier`} requestBody={requestBody} loadMessage="multiplier"
            toParentClose={() => {closeFunction(0)}}
            confirmButton={interactiveDict["confirm-modal"]["multiplier"][language]}
            updateFunction={apiData => {multiplierUpdate(apiData, multiplier, multiplierContext)}}
        />
    )
}
export default MultiplierBronze;