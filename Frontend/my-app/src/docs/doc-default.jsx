//Standard
import React, {useContext} from "react";

//Packages
import ReactHtmlParser from "react-html-parser";

//Local components
import DefaultAPIGet from "../api-interaction/default-api-get";
import DefaultError from "../error-components/default-error";
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";

//Name to id dictionary
import nameIdDict from "./doc-name-id.json";

//Context
import LanguageContext from "../context/language-context";

//Main function
const WrappedDoc = ({docType, match}) => {
    const language = useContext(LanguageContext);
    const docName = match.params.docName.toString();
    const docId = nameIdDict[docName];
    if(docId === undefined){return <DefaultError apiStatus="404" errorDict={{404: "doc-checking-404"}} />}
    else{
        return(
            withDefaultLoadError(
                DefaultAPIGet, InnerDoc, `/docs/${docId}/mount?doc_type=${docType}&language=${language}`,
                "doc-checking", {500: "doc-checking-500", 404: "doc-checking-404"}
            )
        )
    }
}
export default WrappedDoc;

//Article
const InnerDoc = ({state}) => {
    const {docTitle, docDate, docContent} = state;
    return(
        <div>
            <div><h2>{docTitle}</h2></div>
            <div>{docDate}</div>
            <div>{ReactHtmlParser(docContent)}</div>
        </div>
    )
}