//Standard
import React from "react";

//Main function
const TimeLine = ({actions}) => {
    return(
        <div style={{display: "inline-block", marginLeft: "5px", marginRight: "5px"}}>
            <ul style={{listStyleType: "none"}}>
                {actions.map(action => {
                    return(
                        <li key={`${action[0]}_${action[1]}_${action[2]}`}>
                            <TimeLineAction
                                bgColor={action[2]}
                                day={action[0].toISOString().split('T')[0]}
                                hour={action[0].toISOString().split('T')[1].split('.')[0]}
                                message={action[3]}
                            />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
export default TimeLine;

//Timeline action
const TimeLineAction = ({day, hour, message, bgColor}) => {
    return(
        <div style={{backgroundColor: bgColor}}>
            <div style={{display: "inline-block", marginRight: "5px"}}>{day}</div>
            <div style={{display: "inline-block", marginRight: "5px"}}>{hour}</div>
            <div style={{display: "inline-block"}}>{message}</div>
        </div>
    )
}