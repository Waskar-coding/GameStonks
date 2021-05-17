//Standard
import React, {useContext} from "react";

//Useful functions
import getLocalDate from "../../../data-manipulation/date-offset";

//Context
import EventIdContext from "../../../context/event-id-context";

//Main function
const DefaultGlobalUnpacking = ({state, children}) => {
    const eventId = useContext(EventIdContext);
    const eventClass = (eventId[0] === 'J')? eventId.split('_')[0] : eventId;
    const eventThumbnail = require(`../../event-icons/${eventClass}.jpg`);
    return (
        React.cloneElement(children, {
            eventId: eventId,
            title: state.title,
            eventThumbnail: eventThumbnail,
            entity: state.entity,
            currentValue: state.value,
            currentUsers: state.userNumber,
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