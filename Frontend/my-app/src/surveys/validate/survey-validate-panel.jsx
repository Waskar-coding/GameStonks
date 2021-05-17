//Standard
import React, {useContext} from "react";

//Language jsons
import messageDict from "../../language-display/message-classifier.json";

//Context
import LanguageContext from "../../context/language-context";

//Main function
const SurveyPanel = ({questionKeys, errors}) => {
    const language = useContext(LanguageContext);
    const requiredError = messageDict['error']['survey-validate-required'][language];
    return(
        <div>
            {questionKeys.map((questionKey, index) => {
                let backgroundColor = 'green';
                let textColor = 'white';
                let questionError = errors[questionKey];
                if(questionError){
                    backgroundColor = questionError === requiredError? 'yellow' : 'red';
                    textColor = questionError === requiredError? 'black' : 'yellow';
                }
                return(
                    <div
                        key={questionKey}
                        style={{backgroundColor: backgroundColor, color: textColor}}
                    >
                        {index}
                    </div>
                )
            })}
        </div>
    )
}
export default SurveyPanel;