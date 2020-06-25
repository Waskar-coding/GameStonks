import React from "react";

class TimeLine extends React.PureComponent{
    render(){
        return(
            <div style={{display: "inline-block", marginLeft: "5px", marginRight: "5px"}}>
                <div><h1>{this.props.title}</h1></div>
                <div>
                    <ul style={{listStyleType: "none"}}>
                        {this.props.events.map(event => {
                            return(
                                <li key={event[0]}>
                                    <TimeLineEvent
                                        bgColor={event[2]}
                                        day={event[0].split('T')[0]}
                                        hour={event[0].split('T')[1].split('.')[0]}
                                        message={event[3]}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                </div>
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