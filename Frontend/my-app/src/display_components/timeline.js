import React from "react";

class TimeLine extends React.PureComponent{
    render(){
        return(
            <div style={{display: "inline-block", marginLeft: "5px", marginRight: "5px"}}>
                <div><h1>{this.props.title}</h1></div>
                <div>
                    {this.props.events.map(event => {
                        return <div>
                                    <div style={{display: "inline-block", marginRight: "5px"}}>{event[0].split('T')[0]}</div>
                                    <div style={{display: "inline-block", marginRight: "5px"}}>{event[0].split('T')[1].split('.')[0]}</div>
                                    <div style={{display: "inline-block"}}>{event[1]}</div>
                                </div>
                    })}
                </div>
            </div>
        )
    }
}

export default TimeLine;