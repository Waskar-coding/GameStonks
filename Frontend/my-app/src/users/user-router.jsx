//Standard
import React from 'react';

//Packages
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

//Local components
import MyProfile from './user-my-profile';
import WrappedProfileSearch from './user-search';
import FriendProfile from "./user-profile";

//Main function
const UserRouter = () => {
    /*
        Renders either the event search or a particular event depending on the
    */
    return(
        <Router>
            <Switch>
                <Route path={'/users/my_profile'} component={MyProfile} />
                <Route path={'/users/profiles/:steamid'} component={FriendProfile} />
                <Route path={'/users/find'} component={WrappedProfileSearch} />
            </Switch>
        </Router>
    )
}
export default UserRouter;