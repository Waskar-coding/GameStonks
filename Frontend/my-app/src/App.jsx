//Standard
import React, {lazy} from 'react';

//Packages
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import { setAppElement } from "react-modal";

//Local components
import AuthCase from './authentication/auth-case'

//Context
import LanguageContext from "./context/language-context";

//Dynamic local components
const ArticleRouter =  lazy(() => import('./articles/article-router'));
const DocRouter = lazy(() => import('./docs/doc-router'));
const EventRouter = lazy(() => import('./events/event-router'));
const SurveyRouter = lazy(() => import('./surveys/survey-router'));
const UserRouter = lazy(() => import('./users/user-router'));

//Modal settings
setAppElement('#root');

//Main class
class App extends React.Component{
    render(){
        return(
            <LanguageContext.Provider value='ES'>
                <Router>
                    <AuthCase>
                        <React.Suspense fallback={null}>
                            <Switch>
                                <Route path='/docs' component={DocRouter} />
                                <Route path='/blogs' component={ArticleRouter}/>
                                <Route path='/users' component={UserRouter} />
                                <Route path='/events' component={EventRouter} />
                                <Route path='/surveys' component={SurveyRouter} />
                            </Switch>
                        </React.Suspense>
                    </AuthCase>
                </Router>
            </LanguageContext.Provider>
        )
    }
}
export default App;