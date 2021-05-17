//Standard
import React, {useContext} from "react";

//Packages
import {Link} from "react-router-dom";

//Local components
import DefaultAPIGet from "../api-interaction/default-api-get";
import SearchItemList from "../search/search-item-list";
import SearchList from "../search/search-list";

//Useful functions
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";

//Context
import LanguageContext from "../context/language-context";

//Main function
const WrappedArticleSearch = ({location}) => {
    /*
    Wraps the event list into the SearchList HOC in order to pass basic data to the API through it.
    */
    const language = useContext(LanguageContext);
    return(
        <SearchList
            defaultSort="doc_update" displayPerPage = "2" message="doc-message" placeholder="doc-placeholder"
            tooltip="doc-tooltip" notFound="doc-404" location={location}
            options={JSON.stringify({doc_update: interactiveDict['search-form']['doc-update'][language]})}
        >
            <DocSearch />
        </SearchList>
    )
}
export default React.memo(WrappedArticleSearch);

const DocSearch = React.memo(({sort, order, search, page}) => {
    const language = useContext(LanguageContext);
    return(
        withDefaultLoadError(
            DefaultAPIGet, DocList,
            `/docs/find?sort=${sort}&order=${order}&search=${search}&page=${page}&language=${language}`,
            "article-search", {500: "article-search-500", 404: "article-search-404"}
        )
    )
})

const DocList = ({state}) => {
    return <SearchItemList state={state} idName="docId" notFound="doc-search-404" ItemElement={DocBox} />
}

const DocBox = ({item}) => {
    const {docId, docTitle, docDate, docResume, docThumbnail} = item;
    return(
        <Link to={`/blogs/${docId}`}>
            <img src={docThumbnail} alt="article_thumbnail" width="50" />
            <div><h1>{docTitle}</h1></div>
            <div>{docDate}</div>
            <div>{docResume}</div>
        </Link>
    )
}