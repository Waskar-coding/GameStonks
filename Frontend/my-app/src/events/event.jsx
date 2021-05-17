//Standard
import React, {Suspense, useContext} from "react";

//Packages
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";

//Local components
import DefaultLoad from "../load-components/default-load";
import EventTimer from "../display-components/event-timer";

//Useful functions
import DefaultAPIGet from "../api-interaction/default-api-get";
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";

//Context
import LanguageContext from '../context/language-context';

//Main function
const WrappedEvent = ({match}) => {
    const language = useContext(LanguageContext);
    const eventId = match.params.eventId.toString();
    return(
        withDefaultLoadError(
            DefaultAPIGet,
            Event,
            `/events/${eventId}/active?language=${language}`,
            "event-checking",
            {500: "event-checking-500", 404: "event-checking-404", 403: "event-checking-403"}
        )
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
    They also must have an icon on the event-icons folder.
    If no field is specified the -doc script will be rendered.
    */
    const language = useContext(LanguageContext);
    const eventId = state.event_id;
    const eventTitle = state.event_title;
    const final = state.event_final;
    const eventClass = (eventId[0] === 'J')? eventId.split('_')[0] : eventId;
    const eventThumbnail = require(`./event-icons/${eventClass}.jpg`);
    const eventFields = ['doc', 'features', 'global', 'personal', 'offers'];
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
                        let CurrentComponent;
                        if(field === 'offers'){
                            CurrentComponent = React.lazy(() => import("./offers/event-offer-main.jsx"))
                        }
                        else{
                            CurrentComponent = React.lazy(
                                () => import(`./${eventClass}/${eventClass.toLowerCase()}-${field}.jsx`)
                            );
                        }
                        return(
                            <Route key={field} path={`/events/${eventId}/${field}`}>
                                <Suspense fallback={<DefaultLoad loadMessage="event-checking" />}>
                                    <CurrentComponent eventId={eventId} />
                                </Suspense>
                            </Route>
                        )
                    })}
                    <Route key="default" path={`/events/${eventId}`}>
                        <Suspense fallback={<DefaultLoad loadMessage="event-checking" />}>
                            <DefaultComponent eventId={eventId} />
                        </Suspense>
                    </Route>
                </Switch>
            </Router>
        </div>
    )
}