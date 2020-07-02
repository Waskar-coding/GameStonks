import React from "react";
import {Suspense} from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Jackpots from "./jackpot-list";


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
            current: null,
            isLoaded: false
        };
    }
    componentDidMount(){
        const {jackpotId} = this.props.match.params;
        if(jackpotId.toString().substring(0,2) === "J"){
            const CurrentJackpotRouter = React.lazy(() => import(`./${jackpotId.toString().substring(0,3)}/${jackpotId.toString().substring(0,3)}.main`));
            this.setState({
                current: CurrentJackpotRouter,
                isLoaded: true
            });
        }
        else{
            this.setState({
                isLoaded: true
            });
        }
    }
    render(){
        let { jackpotId } = this.props.match.params;
        if((this.state.isLoaded === true) && (this.state.current !== null)){
            const CurrentJackpotRouter = this.state.current;
            return(
                <Suspense fallback={<div>Loading...</div>}>
                    <CurrentJackpotRouter jackpotId={jackpotId.toString()} location={this.props.location}/>
                </Suspense>
            )
        }
        else if((this.state.isLoaded === true) && (this.state.current === null)){
            return(<div><p>This event does not exist</p></div>)
        }
        else{
            return(<div><p>Loading...</p></div>)
        }
    }
}

export default AllJackpots;