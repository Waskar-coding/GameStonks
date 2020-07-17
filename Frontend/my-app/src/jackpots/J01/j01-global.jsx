//Standard
import React from "react";

//Local components
import DefaultGlobalAPI from "../defaults/global/default-global-api";
import DefaultGlobalStack from "../defaults/global/default-global-stack";
import DefaultGlobalUnpacking from "../defaults/global/default-global-unpacking";

//Main function
const J01Global = ({eventId}) => {
    return(
        <DefaultGlobalAPI eventId={eventId}>
            <DefaultGlobalUnpacking>
                <DefaultGlobalStack />
            </DefaultGlobalUnpacking>
        </DefaultGlobalAPI>
    )
}
export default J01Global;