//Standard
import React from "react";

//Packages
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//Language jsons
import interactiveDict from '../language-display/interactive-classifier';

//Context
import LanguageContext from "../language-context";

const monthsEN = [
    'January',
    'Februrary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
const daysEN = [
    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa',
    'Su'
];
registerLocale('EN',{
    localize: {
        month: n => monthsEN[n],
        day: n => daysEN[n]
    },
    formatLong:{}
});

const monthsES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Setiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
];
const daysES = [
    'Lu',
    'Ma',
    'Mi',
    'Ju',
    'Vi',
    'Sá',
    'Do'
];
registerLocale('ES', {
    localize: {
        month: n => monthsES[n],
        day: n => daysES[n]
    },
    formatLong:{}
});

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
                    locale={this.context}
                    selected={this.state.startDate}
                    onChange={date => {this.handleStartChange(date)}}
                    dateFormat='yyyy/MM/dd'
                    minDate={new Date(this.props.minDate)}
                    maxDate={this.state.finalDate}
                    showYearDropDown
                    scrollableMonthYearDropdown
                />
                <DatePicker
                    locale={this.context}
                    selected={this.state.finalDate}
                    onChange={date => {this.handleFinalChange(date)}}
                    dateFormat='yyyy/MM/dd'
                    minDate={this.state.startDate}
                    maxDate={new Date(this.props.maxDate)}
                    showYearDropDown
                    scrollableMonthYearDropdown
                />
                <Tippy content={interactiveDict['date-form']['tooltip'][this.context]}>
                    <input type="submit" value="Ok" />
                </Tippy>
            </form>

        )
    }
}

DateForm.contextType = LanguageContext;

export default DateForm;