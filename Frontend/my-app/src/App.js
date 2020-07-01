import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import AllJackpots from './jackpots/jackpot-router';
import MyProfile from './users/my-profile';
import Profiles from './users/profile-search';
import FriendProfile from "./users/user-profile";
import Modal from "react-modal";
import LanguageContext from "./language-context";

Modal.setAppElement('#root');

class App extends React.Component{
    render(){
        return(
            <LanguageContext.Provider value='ES'>
                <Router>
                    <Switch>
                        <Route path={'/users/profiles/my_profile'} component={MyProfile} />
                        <Route path={'/users/profiles/:steamid'} component={FriendProfile} />
                        <Route path={'/users/find'} component={Profiles} displayPerPage="2" />
                        <Route path={'/events'}><AllJackpots /></Route>
                    </Switch>
                </Router>
            </LanguageContext.Provider>
        )
    }
}

export default App;