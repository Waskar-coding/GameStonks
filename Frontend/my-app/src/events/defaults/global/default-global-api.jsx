//Standard
import React, {useContext} from "react";


//Useful functions
import DefaultAPIGet from "../../../api-interaction/default-api-get";
import withDefaultLoadError from "../../../api-interaction/with-default-load-&-error";

//Context
import EventIdContext from "../../../context/event-id-context";
import LanguageContext from "../../../context/language-context";

//Main function
const DefaultGlobalAPI = ({eventId,Child}) => {
    return (
        <EventIdContext.Provider value={eventId}>
            {withDefaultLoadError(
                DefaultAPIGet,
                Child,
                `/events/${eventId}/public/global?language=${useContext(LanguageContext)}`,
                "event-global",
                {505: "event-global"}
            )}
        </EventIdContext.Provider>
    );
}
export default DefaultGlobalAPI;