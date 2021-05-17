//Standard
import React, {lazy} from 'react';

//Packages
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

//Local components
const WrappedSurvey = lazy(() => import('./survey-main'));
const WrappedSurveySearch = lazy(() => import('./survey-search'));

//Main function
const UserRouter = () => {
    /*
    Renders either the event search or a particular event depending on the
    */
    return(
        <Router>
            <Switch>
                <Route path="/surveys/find" component={WrappedSurveySearch} />
                <Route path="/surveys/:survey_id" component={WrappedSurvey} />
            </Switch>
        </Router>
    )
}
export default UserRouter;