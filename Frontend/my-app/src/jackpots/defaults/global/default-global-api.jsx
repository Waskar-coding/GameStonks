//Standard
import React, {useContext} from "react";

//Useful functions
import DefaultAPIGet from "../../../useful-functions/default-api-get";

//Context
import LanguageContext from "../../../language-context";

//Main function
const DefaultGlobalAPI = ({eventId,children}) => {
    return (
        <DefaultAPIGet
            url={`/jackpots/${eventId}/public/global?language=${useContext(LanguageContext)}`}
            loadMessage="event-global"
            errorMessage={{505: "event-global"}}
        >
            {React.cloneElement(children, {eventId: eventId})}
        </DefaultAPIGet>
    );
}
export default DefaultGlobalAPI;