//Standard
import React from "react";

//Packages
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

//Local components
import WrappedDoc from "./doc-default";

//Main function
const DocRouter = () => {
    /*
    Renders either the default component for a document or special documents that require additional data
    */
    return(
        <Router>
            <Switch>
                <Route path="/docs/:docName" render={(props) => <WrappedDoc {...props} docType="wiki"/>}/>
            </Switch>
        </Router>
    )
}
export default DocRouter;