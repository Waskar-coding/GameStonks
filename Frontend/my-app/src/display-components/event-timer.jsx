//Standard
import React, {useContext, useEffect, useState} from "react";

//Packages
import { floor } from "math";

//Language jsons
import otherDict from "../language-display/other-classifier";

//Context
import LanguageContext from "../language-context";

//Main class
const EventTimer = ({limitDate}) => {
    /*
        Simple timer implementation, receives a limit date as props and
        displays the countdown from the current date in the format:
            [days] [language word for days] [hours]:[minutes]:[seconds]
        When the limit date is reached the timer remains static at:
            0 [language word for days] 00:00:00
    */
    const language = useContext(LanguageContext);
    const [currentDate, setCurrentDate] = useState(new Date().getTime());
    useEffect(() => {
        const timer = setInterval(() => setCurrentDate(new Date().getTime()),1000);
        return() => {
            clearInterval(timer)
        }
    },[]);
    const addZeroAhead = (time) => {
        //Adds a zero ahead of the hours, minutes or seconds in case their are inferior to 10. Returns them as Strings.
        return (time/10 >= 1)? time.toString() : '0' + time.toString();
    }
    /*
           The Interval variable is expressed in microseconds, to get the desired display format it
           is necessary to separate them into integer numbers expressing days, hours, minutes and seconds
       */

    /*
        Display format: [days] [language word for days] [hours]:[minutes]:[seconds].
        Hours, minutes and seconds always with two digits
    */
    let interval = limitDate - currentDate;
    const days = floor(interval/(24*3600*1000));
    interval = interval - 24*3600*1000*days;
    const hours = floor(interval/(3600*1000));
    interval = interval - 3600*1000*hours;
    const minutes = floor(interval/(60*1000));
    interval = interval - 60*1000*minutes;
    const seconds = floor(interval/1000);
    return(
        <div>
            <span>{days.toString()} {otherDict['timer']['days'][language]} </span>
            <span>{addZeroAhead(hours)}</span>
            <span>:</span>
            <span>{addZeroAhead(minutes)}</span>
            <span>:</span>
            <span>{addZeroAhead(seconds)}</span>
        </div>
    )
}
export default EventTimer;