//Standard
import React from "react";

//Local components
import DefaultGlobalAPI from "../defaults/global/default-global-api";
import DefaultGlobalStack from "../defaults/global/default-global-stack";
import DefaultGlobalUnpacking from "../defaults/global/default-global-unpacking";

//Main function
const WrappedJ01Global = ({eventId}) => {return(<DefaultGlobalAPI eventId={eventId} Child={InnerJ01Global} />)}
export default WrappedJ01Global;

const InnerJ01Global = ({state}) => {
    return(<DefaultGlobalUnpacking state={state}><DefaultGlobalStack /></DefaultGlobalUnpacking>)
}