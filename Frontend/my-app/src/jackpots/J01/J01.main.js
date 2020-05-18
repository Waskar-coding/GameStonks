import React from "react";
import J01Docs from "./J01.docs";
import J01Features from "./J01.features"
import J01Global from "./J01.global";
import J01Personal from "./J01.personal";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

class CurrentJackpotRouter extends React.Component{
    render(){
        return(
            <Router>
                <div>
                    <nav>
                        <ul>
                            <li><Link to={`/jackpots/${this.props.jackpotId}/documents`}>Documents</Link></li>
                            <li><Link to={`/jackpots/${this.props.jackpotId}/features`}>Features</Link></li>
                            <li><Link to={`/jackpots/${this.props.jackpotId}/global`}>Global stats</Link></li>
                            <li><Link to={`/jackpots/${this.props.jackpotId}/personal`}>Personal stats</Link></li>
                        </ul>
                    </nav>
                </div>
                <Switch>
                    <Route path="/jackpots/:jackpotId/documents"><J01Docs /></Route>
                    <Route path="/jackpots/:jackpotId/global"><J01Global jackpotId={this.props.jackpotId} /></Route>
                    <Route path="/jackpots/:jackpotId/personal"><J01Personal jackpotId={this.props.jackpotId} /></Route>
                    <Route path="/jackpots/:jackpotId/features"><J01Features
                        displayPerPage="15"
                        jackpotId={this.props.jackpotId}
                        location={this.props.location}
                        />
                        </Route>
                    <Route path="/jackpots/:jackpotId"><J01Docs /></Route>
                </Switch>
            </Router>
        )
    }
}

export default CurrentJackpotRouter;