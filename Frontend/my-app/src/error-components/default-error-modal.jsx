//Standard
import React, {useContext} from "react";

//Local components
import DefaultError from "./default-error";
import ModalMessage from "../modals/modal-message";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";

//Context
import FunctionContext from "../context/function-context";
import LanguageContext from "../context/language-context";

//Main function
const DefaultErrorModal = ({apiStatus, errorDict}) => {
    const language = useContext(LanguageContext)
    const setDisplay = useContext(FunctionContext);
    return (
        <ModalMessage toParent={() => setDisplay(0)} message={interactiveDict["message-modal"]["ok"][language]}>
            <DefaultError apiStatus={apiStatus} errorDict={errorDict} />
        </ModalMessage>
    )
}
export default DefaultErrorModal;