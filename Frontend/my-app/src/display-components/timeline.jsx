//Standard
import React from "react";

//Main function
const TimeLine = ({events}) => {
    return(
        <div style={{display: "inline-block", marginLeft: "5px", marginRight: "5px"}}>
            <ul style={{listStyleType: "none"}}>
                {events.map(event => {
                    return(
                        <li key={event[0]}>
                            <TimeLineEvent
                                bgColor={event[2]}
                                day={event[0].toISOString().split('T')[0]}
                                hour={event[0].toISOString().split('T')[1].split('.')[0]}
                                message={event[3]}
                            />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
export default TimeLine;

//Timeline event
const TimeLineEvent = ({day, hour, message, bgColor}) => {
    return(
        <div style={{backgroundColor: bgColor}}>
            <div style={{display: "inline-block", marginRight: "5px"}}>{day}</div>
            <div style={{display: "inline-block", marginRight: "5px"}}>{hour}</div>
            <div style={{display: "inline-block"}}>{message}</div>
        </div>
    )
}