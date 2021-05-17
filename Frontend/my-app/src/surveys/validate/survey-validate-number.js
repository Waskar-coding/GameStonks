//Useful functions
import processMessage from "../../language-display/process-message";

//Language jsons
import messageDict from '../../language-display/message-classifier.json';

//Main function
const validateNumber = (answer, restrictions, language) => {
    if(isNaN(answer) === true) return messageDict['error']['survey-validate-number'][language];
    if(restrictions.length === 1) return "";
    if(!isNaN(restrictions[1])){
        return Number(answer) < Number(restrictions[1])?
            processMessage(language, ['error', 'survey-validate-lower-limit', restrictions[1]]) : "";
    }
    if(!isNaN(restrictions[2])){
        return Number(answer) > Number(restrictions[2])?
            processMessage(language, ['error', 'survey-validate-upper-limit', restrictions[2]]) : "";
    }
    return "";
}
export default validateNumber;