//Standard
import React, {useContext} from "react";

//Packages
import Modal from "react-modal";

//Language jsons
import messageDict from "../language-display/message-classifier.json";

//Context
import LanguageContext from "../context/language-context";

//Main function
const LoadModal = ({loadMessage}) => {
    const language = useContext(LanguageContext);
    return (<Modal isOpen={true}>{messageDict["loading"][loadMessage][language]}</Modal>)}
export default LoadModal;