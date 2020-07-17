//Standard
import React from "react";

//Packages
import {floor} from "math";

//Language jsons
import otherDict from "../language-display/other-classifier";

class EventTimer extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            currentDate: null
        }
    }
    componentDidMount() {
        this.setState({
            currentDate: new Date().getTime()
        });
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return nextState.currentDate !== this.state.currentDate
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(this.state.currentDate);
        console.log(this.props.limitDate);
        if((this.props.limitDate - this.state.currentDate) > 0){
             setTimeout(() => this.setState({currentDate: new Date().getTime()}),1000)
        }
    }
    render(){
        let interval = this.props.limitDate - this.state.currentDate;
        const days = floor(interval/(24*3600*1000));
        interval = interval - 24*3600*1000*days;
        const hours = floor(interval/(3600*1000));
        interval = interval - 3600*1000*hours;
        const minutes = floor(interval/(60*1000));
        interval = interval - 60*1000*minutes;
        const seconds = floor(interval/1000);
        return(
            <div>
                <span>{days} {otherDict['timer']['days'][this.props.language]} </span>
                <span>{hours}</span>
                <span>:</span>
                <span>{minutes}</span>
                <span>:</span>
                <span>{(seconds/10 > 1)? (seconds):('0'+seconds.toString())}</span>
            </div>)
    }
}

export default EventTimer;