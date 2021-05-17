//Standard
import React from "react";

//Useful functions
import DefaultAPIGet from "../../../api-interaction/default-api-get";
import withDefaultLoadError from "../../../api-interaction/with-default-load-&-error";

//Context
import EventIdContext from "../../../context/event-id-context";

//Main function
const DefaultPersonalAPI = ({eventId, Child}) => {
    return (
        <EventIdContext.Provider value={eventId}>
            {withDefaultLoadError(
                DefaultAPIGet,
                Child,
                `/events/${eventId}/private/personal`,
                "event-personal",
                {500:"event-personal-500", 403:"event-personal-403"}
            )}
        </EventIdContext.Provider>
    )
}
export default DefaultPersonalAPI;