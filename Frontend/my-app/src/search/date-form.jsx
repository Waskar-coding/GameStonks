//Standard
import React, {useContext, useEffect, useRef, useState} from "react";

//Packages
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//Language jsons
import interactiveDict from '../language-display/interactive-classifier';

//Context
import LanguageContext from "../context/language-context";

//Main function
const DateForm = ({minDate, maxDate, defaultStart, defaultFinal, toParent}) => {
    const language = useContext(LanguageContext);
    const [loadingLocale, setLoadingLocale] = useState(true);
    useEffect(() => {
        const registerLocaleWithHooks = async () => {
            const {localeMonths, localeDays} = await import(`./locales/locale-${language}`);
            registerLocale(language, {localize:{month: n => localeMonths[n],day: n => localeDays[n]},formatLong:{}});
        };
        registerLocaleWithHooks().then(() => setLoadingLocale(false));
    }, [language]);
    const [modified, setModified] = useState(false);
    const [startDate, setStartDate] = useState(defaultStart);
    const handleStartDateChange = (date) => {
        setStartDate(date);
        setModified(true);
    };
    const [finalDate, setFinalDate] = useState(defaultFinal);
    const handleFinalDateChange = (date) => {
        setFinalDate(date)
        setModified(true);
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        modified && toParent(startDate, finalDate);
        setModified(false);
        setTimeout(submitButton.current.blur(), 500);
    };
    const submitButton = useRef(null);
    return(
        <React.Fragment>
            {!loadingLocale &&
                <form onSubmit={handleSubmit}>
                    <DatePicker
                        locale={language}
                        selected={startDate}
                        onChange={date => {handleStartDateChange(date)}}
                        dateFormat='yyyy/MM/dd'
                        minDate={new Date(minDate)}
                        maxDate={finalDate}
                        showYearDropDown
                        scrollableMonthYearDropdown
                    />
                    <DatePicker
                        locale={language}
                        selected={finalDate}
                        onChange={date => {handleFinalDateChange(date)}}
                        dateFormat='yyyy/MM/dd'
                        minDate={startDate}
                        maxDate={new Date(maxDate)}
                        showYearDropDown
                        scrollableMonthYearDropdown
                    />
                    <Tippy content={interactiveDict['date-form']['tooltip'][language]}>
                        <input ref={submitButton} type="submit" value="Ok" />
                    </Tippy>
                </form>
            }
        </React.Fragment>
    )
}
export default DateForm;