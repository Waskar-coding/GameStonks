//Standard
import React, {useContext} from "react";

//Language jsons
import messageDict from "../language-display/message-classifier.json";

//Context
import LanguageContext from "../context/language-context";

//Main function
const DefaultLoad = ({loadMessage}) => {
    return (<div>{messageDict['loading'][loadMessage][useContext(LanguageContext)]}</div>)
};
export default DefaultLoad;