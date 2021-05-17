//Standard
import React, { useContext } from "react";

//Language jsons
import messageDict from "../../../language-display/message-classifier.json";

//Context
import LanguageContext from "../../../context/language-context";

//Main function
const DefaultPersonalChecking = ({eventId, state, children}) => {
    const language = useContext(LanguageContext);
    if(state.register === null){
        return(<div>{messageDict['event-personal']['no-register'][language]}</div>)
    }
    else if(state.register.status === 'k'){
        return(<div>{messageDict['event-personal']['kicked'][language]}</div>)
    }
    else{
        return(<div>{React.cloneElement(children, {eventId: eventId, state: state})}</div>)
    }
}
export default DefaultPersonalChecking;