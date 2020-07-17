//Standard
import React from "react";

//Useful functions
import DefaultAPIGet from "../../../useful-functions/default-api-get";

//Main function
const DefaultPersonalAPI = ({eventId, children}) => {
    return (
        <DefaultAPIGet
            url={`/jackpots/${eventId}/private/personal`}
            loadMessage="event-personal"
            errorMessage={
                {
                    500:"event-personal-500",
                    403:"event-personal-403"
                }
            }
        >
            {React.cloneElement(children, {eventId: eventId})}
        </DefaultAPIGet>
    )
}
export default DefaultPersonalAPI;