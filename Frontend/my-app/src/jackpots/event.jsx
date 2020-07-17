//Standard
import React, {Suspense, useContext} from "react";

//Packages
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";

//Local components
import EventTimer from "../display-components/event-timer";

//Useful functions
import DefaultAPIGet from "../useful-functions/default-api-get";
import interactiveDict from "../language-display/interactive-classifier.json";

//Context
import LanguageContext from '../language-context';

//Main function
const WrappedEvent = ({match}) => {
    const language = useContext(LanguageContext);
    const eventId = match.params.eventId.toString();
    console.log(eventId);
    return(
        <DefaultAPIGet
            url={`/jackpots/${eventId}/active?language=${language}`}
            loadMessage="event-checking"
            errorMessage={{
                505: "event-checking-505",
                404: "event-checking-404",
                403: "event-checking-403"
            }}
        >
            <Event />
        </DefaultAPIGet>
    )
}
export default WrappedEvent;
const Event = ({state}) => {
    /*
        Loads and event with the following steps:
            1. Uses an API to check whether the event is valid
            2. In case the event is valid (exists and is classified as active)
                it will dynamically import the code for the event using React.Lazy.
                It will render an error message if the event is not valid.
        Every active event must have a folder this directory with its id (or class
        name) with at least the following files:
            * [id or class]-doc
            * [id or class]-global
            * [id or class]-features
            * [id or class]-personal
        They also must have an icon on the jackpot-icons folder.
        If no field is specified the -doc script will be rendered.
    */
    const language = useContext(LanguageContext);
    const eventId = state.jackpot_id;
    const eventTitle = state.jackpot_title;
    const final = state.jackpot_final;
    const eventClass = (eventId[0] === 'J')? eventId.split('_')[0] : eventId;
    const eventThumbnail = require(`./jackpot-icons/${eventClass}.jpg`);
    const eventFields = ['doc', 'features', 'global', 'personal'];
    const DefaultComponent = React.lazy((() => import(`./${eventClass}/${eventClass.toLowerCase()}-doc.jsx`)));
    return (
        <div>
            <h1>{eventTitle}</h1>
            <img src={eventThumbnail} alt='Event thumbnail' />
            <EventTimer limitDate={new Date(final).getTime()} />
            <Router>
                <div>
                    <nav>
                        <ul>
                            {eventFields.map(field => {
                                return(
                                    <li key={field}>
                                        <Link to={`/events/${eventId}/${field}`}>
                                            {interactiveDict['event-router'][field][language]}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </div>
                <Switch>
                    {eventFields.map(field => {
                        const CurrentComponent = React.lazy(
                            () => import(`./${eventClass}/${eventClass.toLowerCase()}-${field}.jsx`)
                        );
                        return(
                            <Route key={field} path={`/events/${eventId}/${field}`}>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <CurrentComponent eventId={eventId} />
                                </Suspense>
                            </Route>
                        )
                    })}
                    <Route key="default" path={`/events/${eventId}`}>
                        <Suspense fallback={<div>Loading...</div>}>
                            <DefaultComponent eventId={eventId} />
                        </Suspense>
                    </Route>
                </Switch>
            </Router>
        </div>
    )
}