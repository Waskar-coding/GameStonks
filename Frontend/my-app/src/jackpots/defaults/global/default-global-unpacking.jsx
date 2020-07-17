//Standard
import React from "react";

//Useful functions
import getLocalDate from "../../../useful-functions/date-offset";

//Main function
const DefaultGlobalUnpacking = ({eventId, state, children}) => {
    const eventClass = (eventId[0] === 'J')? eventId.split('_')[0] : eventId;
    const eventThumbnail = require(`../../jackpot-icons/${eventClass}.jpg`);
    return (
        React.cloneElement(children, {
            eventId: eventId,
            title: state.title,
            eventThumbnail: eventThumbnail,
            entity: state.entity,
            current_value: state.current_value,
            current_users: state.current_users,
            start: getLocalDate(new Date(state.start)),
            final: getLocalDate(new Date(state.final)),
            multipliers: state.multipliers,
            users: state.users.map(point => {
                return {x: getLocalDate(new Date(point[0])).getTime(),y: point[1]}
            }),
            price: state.price.map(point => {
                return {x: getLocalDate(new Date(point[0])).getTime(),y: point[1]}
            }),
            score: state.score,
            top: state.top
        })
    )
}
export default DefaultGlobalUnpacking;