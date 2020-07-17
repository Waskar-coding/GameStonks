//Standard
import React from "react";

//Packages
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

//Local components
import WrappedEventSearch from "./event-search";
import Event from "./event";

//Main class
const EventRouter = () => {
    /*
        Renders either the event search or a particular event depending on the
    */
    return(
        <Router>
            <Switch>
                <Route path="/events/find" component={WrappedEventSearch} displayPerPage="2"/>
                <Route path="/events/:eventId" component={Event} />
            </Switch>
        </Router>
    )
}
export default EventRouter;