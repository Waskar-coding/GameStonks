//Standard
import React from 'react';

//Packages
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

//Local components
import MyProfile from './my-profile';
import WrappedProfileSearch from './profile-search';
import FriendProfile from "./user-profile";

//Main class
class ProfileRouter extends React.Component{
    /*
        Renders either the event search or a particular event depending on the
    */
    render(){
        return(
            <Router>
                <div>Welcome to profile router</div>
                <Switch>
                    <Route path={'/users/profiles/my_profile'} component={MyProfile} />
                    <Route path={'/users/profiles/:steamid'} component={FriendProfile} />
                    <Route path={'/users/find'} component={WrappedProfileSearch} />
                </Switch>
            </Router>
        )
    }
}
export default ProfileRouter;