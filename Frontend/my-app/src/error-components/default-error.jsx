//Standard
import React, {useContext} from "react";

//Language jsons
import messageDict from "../language-display/message-classifier.json";

//Context
import LanguageContext from "../context/language-context";

//Main function
const DefaultError = ({apiStatus, errorDict}) => {
    return (<div>{messageDict['error'][errorDict[apiStatus]][useContext(LanguageContext)]}</div>)
};
export default DefaultError;