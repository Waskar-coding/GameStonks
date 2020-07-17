//Standard
import React from 'react';

//Packages
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import { setAppElement } from "react-modal";

//Local components
import EventRouter from './jackpots/event-router';
import ProfileRouter from './users/profile-router';

//Context
import LanguageContext from "./language-context";

//Modal settings
setAppElement('#root');

//Main class
class App extends React.Component{
    render(){
        return(
            <LanguageContext.Provider value='ES'>
                <Router>
                    <Switch>
                        <Route path={'/users'} component={ProfileRouter} />
                        <Route path={'/events'} component={EventRouter} />
                    </Switch>
                </Router>
            </LanguageContext.Provider>
        )
    }
}
export default App;