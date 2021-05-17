//Standard
import React, {useContext} from "react";

//Local components
import NotificationMessage from "./notification-message";

//Useful functions
import processMessage from "../language-display/process-message";

//Context
import LanguageContext from "../context/language-context";

//Main function
const NotificationStrike = ({alertData}) => {
    const language = useContext(LanguageContext);
    return (
        <div>
            <NotificationMessage alertData={alertData} />
            <div>{processMessage(language, ['success', 'event-post-strike', alertData.currentStrikes])}</div>
        </div>
    )
}
export default NotificationStrike;