//Standard
import React, {useState, useEffect, useReducer, useContext} from "react";

//Packages
import queryString from "query-string";

//Local components
import PageList from "./page-list";
import SearchForm from "./search-form";

//Useful functions
import findMaxPage from "./max-page";

//Language jsons
import messageDict from "../language-display/message-classifier";

//Context
import LanguageContext from "../context/language-context";
import {CurrentItems, SearchParams} from "../context/search-context";

//Update location
export const updateLocation = (location, defaultSort) => {
    /*
    Parses the querystring and modifies the state of the main class,
    if the querystring does not exist, or it is invalid return default
    values
    */
    const {page, sort, order, search} = queryString.parse(location);
    if((page !== undefined) && (sort !== undefined) && (order !== undefined) && (search !== undefined)) return {
        error: null, sort: sort, order: order, search: search, page: Number(page)
    }
    else if(defaultSort!== "") return {
        error: null, sort: defaultSort, order: '1', search: "", page: page !== undefined? Number(page) : 1
    }
    else return {error: null, page: page !== undefined? Number(page) : 1}
}

//Search params reducer
export const searchParamsReducer = (state, action) => {
    switch(action.type){
        case "back":
            return updateLocation(window.location.search, action.defaultSort)
        case "form":
            return({...state, sort: action.sort, order: action.order, search: action.search, page: 1})
        case "page":
            return ({...state, page: Number(action.page)})
        default:
            return state
    }
}

//Main function
const SearchList = ({
    defaultSort, displayPerPage, message, placeholder, tooltip, options, children
}) => {
    const language = useContext(LanguageContext);
    const [searchParams, setSearchParams] = useReducer(
        searchParamsReducer,
        updateLocation(window.location.search, defaultSort),
        () => updateLocation(window.location.search, defaultSort)
    );
    const [currentItems, setCurrentItems] = useState(0);
    const currentPage = queryString.parse(window.location.search).page;
    useEffect(() => {
        if(currentPage !== setSearchParams.page){
            setSearchParams({type: 'page', page: currentPage});
        }
    }, [currentPage])
    useEffect(() => {
        window.onpopstate = () => {setSearchParams({type: "back", defaultSort: defaultSort})}
    }, [defaultSort]);
    return(
        <SearchParams.Provider value={{searchParams: searchParams, setSearchParams: setSearchParams}}>
            <CurrentItems.Provider value={{currentItems: currentItems, setCurrentItems: setCurrentItems}}>
                <SearchForm
                    message={`${messageDict['Search'][message][language]}${currentItems}`} options={options}
                    placeholder={messageDict['Search'][placeholder][language]} tooltip={tooltip}
                />
                {
                    React.cloneElement(children, {
                        page: searchParams.page, sort: searchParams.sort,
                        order: searchParams.order, search: searchParams.search,
                    })
                }
                <PageList current={searchParams.page} maxPage={findMaxPage(currentItems, displayPerPage)} />
            </CurrentItems.Provider>
        </SearchParams.Provider>
    )
}
export default React.memo(SearchList);