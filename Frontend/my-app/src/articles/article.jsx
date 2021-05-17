//Standard
import React, {useContext} from "react";

//Packages
import ReactHtmlParser from "react-html-parser";

//Local components
import DefaultAPIGet from "../api-interaction/default-api-get";
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";

//Context
import LanguageContext from "../context/language-context";

//Main function
const WrappedArticle = ({match}) => {
    const language = useContext(LanguageContext);
    const docId = match.params.docId.toString();
    console.log(docId);
    return(
        withDefaultLoadError(
            DefaultAPIGet, Article, `/docs/${docId}/mount?doc_type=article&language=${language}`,
            "article-checking", {500: "article-checking-500", 404: "article-checking-404"}
        )
    )
}
export default WrappedArticle;

//Article
const Article = ({state}) => {
    const {docTitle, docDate, docContent} = state;
    return(
        <div>
            <div><h2>{docTitle}</h2></div>
            <div>{docDate}</div>
            <div>{ReactHtmlParser(docContent)}</div>
        </div>
    )
}