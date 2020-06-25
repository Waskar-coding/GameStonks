import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import AllJackpots from './jackpots/JackpotRouter';
import MyProfile from './users/my-profile';
import Profiles from './users/profile-search';
import UserProfile from "./users/user-profile";
import Modal from "react-modal";

Modal.setAppElement('#root');

class App extends React.Component{
    render(){
        return(
            <Router>
                <Switch>
                    <Route path={'/users/profiles/my_profile'} component={MyProfile} />
                    <Route path={'/users/profiles/:name'} component={UserProfile} />
                    <Route path={'/users/find'} component={Profiles} displayPerPage="2" />
                    <Route path={'/jackpots'}><AllJackpots /></Route>
                </Switch>
            </Router>
        )
    }
}

export default App;