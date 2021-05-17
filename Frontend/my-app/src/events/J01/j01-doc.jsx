//Standard
import {useContext} from "react";

//Packages
import ReactHtmlParser from "react-html-parser";

//Local components
import DefaultAPIGet from "../../api-interaction/default-api-get";

//Useful functions
import withDefaultLoadError from "../../api-interaction/with-default-load-&-error";

//Context
import LanguageContext from "../../context/language-context";

//Wrapped class
const WrappedJ01Doc = () => {
    const language = useContext(LanguageContext);
    return(
        withDefaultLoadError(
            DefaultAPIGet, InnerJ01Doc,
            `/docs/5f52653297c3c89627731fc5/mount?doc_type=instructions&language=${language}`,
            "doc-checking", {500: "doc-checking-500", 404: "doc-checking-404"}
        )
    )
}
export default WrappedJ01Doc;

//Inner class
const InnerJ01Doc = ({state}) => {return(ReactHtmlParser(state.docContent))}