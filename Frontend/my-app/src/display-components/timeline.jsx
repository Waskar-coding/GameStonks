import React from "react";
import getLocalDate from "../useful-functions/date-offset";

class TimeLine extends React.PureComponent{
    render(){
        return(
            <div style={{display: "inline-block", marginLeft: "5px", marginRight: "5px"}}>
                <ul style={{listStyleType: "none"}}>
                    {this.props.events.map(event => {
                        const dateLocal = getLocalDate(new Date(event[0])).toISOString();
                        return(
                            <li key={event[0]}>
                                <TimeLineEvent
                                    bgColor={event[2]}
                                    day={dateLocal.split('T')[0]}
                                    hour={dateLocal.split('T')[1].split('.')[0]}
                                    message={event[3]}
                                />
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }
}

class TimeLineEvent extends React.PureComponent{
    render(){
        return(
            <div style={{backgroundColor: this.props.bgColor}}>
                <div style={{display: "inline-block", marginRight: "5px"}}>
                    {this.props.day}
                </div>
                <div style={{display: "inline-block", marginRight: "5px"}}>
                    {this.props.hour}
                </div>
                <div style={{display: "inline-block"}}>
                {this.props.message}
                </div>
            </div>
        )
    }
}
export default TimeLine;