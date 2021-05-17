//Standard
import React, {useContext} from "react";

//Useful functions
import processAction from "../language-display/process-action";

//Context
import LanguageContext from "../context/language-context";

//Main function
const NotificationMessage = ({alertData}) => {
    const language = useContext(LanguageContext);
    return <div>{processAction(language, '1st', alertData.action)[3]}</div>
}
export default NotificationMessage;