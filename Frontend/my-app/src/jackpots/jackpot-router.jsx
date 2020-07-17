//Standard
import React from "react";
import {Suspense} from "react";

//Packages
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

//Router json
import eventComponentDict from "./event-component-load";

//Language json
import linkDict from "../language-display/link-classifier";

//Local components
import Jackpots from "./jackpot-search";
import EventTimer from "../display-components/event-timer";

//Language jsons
import messageDict from '../language-display/message-classifier';

//Context
import LanguageContext from '../language-context';


class AllJackpots extends React.Component{
    render(){
        return(
            <Router>
                <Switch>
                    <Route path="/events/find" component={Jackpots} displayPerPage="2"/>
                    <Route path="/events/:jackpotId" component={JackpotRouter} />
                </Switch>
            </Router>
    )
    }
}

class JackpotRouter extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            jackpotClass: null,
            files: [],
            isLoaded: false,
            error: null,
            final: null
        };
    }
    componentDidMount(){
        let {jackpotId} = this.props.match.params;
        jackpotId = jackpotId.toString();
        const jClass = (jackpotId.substring(0,1) === 'J')? jackpotId.substring(0,3) : jackpotId;
        this.setState({
            jackpotClass: jClass
        });
        fetch(`/jackpots/${jackpotId}/active`)
            .then(res => res.json())
            .then(res => {
                if(res.error !== null){
                    this.setState({error: res.error})
                }
                else{
                    this.setState({
                        files: eventComponentDict[jClass].map(fileArray => {
                            return [
                                fileArray[0],
                                React.lazy(() => import(`./${jClass}/${fileArray[1]}.jsx`))
                            ]
                        }),
                        isLoaded: true,
                        final: res.jackpot_final
                    });
                }
            })
    }
    render(){
        let { jackpotId } = this.props.match.params;
        const jClass = this.state.jackpotClass;
        const DefaultComponent = (this.state.files.length > 0)? this.state.files[0][1] : null;
        console.log(this.state.final);
        if((this.state.isLoaded === true) && (this.state.files.length !== 0)){
            return(
                <div>
                    <EventTimer
                        limitDate={new Date(this.state.final).getTime()}
                        language={this.context}
                    />
                    <Router>
                        <div>
                            <nav>
                                <ul>
                                    {this.state.files.map(file => {
                                        return(
                                            <li key={file[0]}>
                                                <Link to={`/events/${jackpotId}/${file[0]}`}>
                                                    {linkDict['jackpot-router'][jClass][file[0]][this.context]}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </nav>
                        </div>
                        <Switch>
                            {this.state.files.map(file => {
                                const CurrentComponent = file[1];
                                return(
                                    <Route key={file[0]} path={`/events/${jackpotId}/${file[0]}`}>
                                        <Suspense fallback={<div>Loading...</div>}>
                                            <CurrentComponent jackpotId={jackpotId} />
                                        </Suspense>
                                    </Route>
                                )
                            })}
                            <Route key="default" path={`/events/${jackpotId}/${this.state.files[0][0]}`}>
                                <DefaultComponent jackpotId={jackpotId} />
                            </Route>
                        </Switch>
                    </Router>
                </div>
            )
        }
        else if(this.state.error !== null){
            return(<div>{messageDict['jackpot-router'][this.state.error][this.context]}</div>)
        }
        else{
            return(<div>Loading...></div>)
        }
    }
}
JackpotRouter.contextType = LanguageContext;

export default AllJackpots;