import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class DateForm extends React.Component{
    constructor(props){
        super(props);
        this.state =({
            startDate: new Date(props.defaultStart),
            finalDate: new Date(props.defaultFinal)
        });
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleFinalChange = this.handleFinalChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (nextState.startDate !== this.state.startDate) || (nextState.finalDate !== this.state.finalDate)
    }

    handleStartChange(date){
        this.setState({
            startDate: date
        });
    }
    handleFinalChange(date){
        this.setState({
            finalDate: date
        });
    }
    handleSubmit(event){
        event.preventDefault();
        this.props.toParent(this.state.startDate,this.state.finalDate)
    }
    render(){
        return(
            <form onSubmit={this.handleSubmit}>
                <DatePicker
                    selected={this.state.startDate}
                    onChange={date => {this.handleStartChange(date)}}
                    dateFormat='yyyy/MM/dd'
                    minDate={new Date(this.props.minDate)}
                    maxDate={this.state.finalDate}
                    showYearDropDown
                    scrollableMonthYearDropdown
                />
                <DatePicker
                    selected={this.state.finalDate}
                    onChange={date => {this.handleFinalChange(date)}}
                    dateFormat='yyyy/MM/dd'
                    minDate={this.state.startDate}
                    maxDate={new Date()}
                    showYearDropDown
                    scrollableMonthYearDropdown
                />
                <input type="submit" value="Submit" />
            </form>

        )
    }
}

export default DateForm;