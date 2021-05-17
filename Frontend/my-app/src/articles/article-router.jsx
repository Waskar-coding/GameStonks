//Standard
import React from "react";

//Packages
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

//Local components
import Article from "./article";
import WrappedArticleSearch from "./article-search";

//Main class
const ArticleRouter = () => {
    /*
    Renders either the article search or a particular article depending on the location
    */
    return(
        <Router>
            <Switch>
                <Route path="/blogs/find" component={WrappedArticleSearch}/>
                <Route path="/blogs/:docId" component={Article} />
            </Switch>
        </Router>
    )
}
export default ArticleRouter;