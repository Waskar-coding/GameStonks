//Standard
import React, {useContext, useRef, useState} from "react";

//Packages
import queryString from "query-string";
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';

//Local stylesheets
import "./SearchForm.css";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier";

//Context
import LanguageContext from "../context/language-context";
import {SearchParams} from "../context/search-context";

//Main function
const SearchForm = ({message, options, placeholder ,tooltip}) => {
    const language = useContext(LanguageContext);
    const {searchParams, setSearchParams} = useContext(SearchParams);
    const [searchState, setSearchState] = useState({
        sort: searchParams.sort,
        order: searchParams.order,
        search: searchParams.search
    });
    const [modified, setModified] = useState(false);
    const [searchModified, setSearchModified] = useState(false);
    const handleParamChange = (event) => {
        setSearchState({...searchParams, [event.target.id]: event.target.value});
        setModified(true);
        if(event.target.id === 'search'){
            setSearchModified(true);
        }
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        const {sort, order, search} = searchState;
        const parsedLocation = queryString.parse(window.location.search);
        let nextUrl  = Object.entries(parsedLocation).reduce((currentUrl, [key, value]) => {
            if((key === 'sort') || (key === 'order') || (key === 'search') || (key=== 'page')) return currentUrl;
            else return currentUrl + key + '=' + value + '&'
        }, '?');
        nextUrl = nextUrl + `sort=${sort}&order=${order}&search=${search}&page=1`;
        if((!searchModified) && (Number(message[message.length-1]) === 0)){
            window.history.pushState(searchState, 'title', nextUrl);
        }
        else if(modified){
            window.history.pushState(searchState, 'title', nextUrl);
            setSearchParams({type: "form", sort: sort, order: order, search: search})
            setModified(false);
            setSearchModified(false);
        }
        setTimeout(submitButton.current.blur(), 500);
    }
    const submitButton = useRef(null);
    const filterFields = Object.entries(JSON.parse(options));
    return(
        <div className="searchform">
            <div className="message_case">{message}</div>
            <form className="params_case" onSubmit={handleSubmit} >
                <div className="param">
                    <label id="sort">{interactiveDict['search-form']['sort'][language]}</label>
                    <select id="sort" value={searchState.sort} onChange={handleParamChange}>
                        {filterFields.map(item => {
                            return <option key={item[0]} value={item[0]}>{item[1]}</option>
                        })}
                    </select>
                </div>
                <div className="param">
                    <label id="order">{interactiveDict['search-form']['order'][language]}</label>
                    <select id="order" value={searchState.order} onChange={handleParamChange}>
                        <option value="1">{interactiveDict['search-form']['order-ascending'][language]}</option>
                        <option value="-1">{interactiveDict['search-form']['order-descending'][language]}</option>
                    </select>
                </div>
                <div className="param">
                    <label id="search">{interactiveDict['search-form']['search'][language]}</label>
                    <input
                        type="text" id="search" value={searchState.search}
                        onChange={handleParamChange} placeholder={placeholder}
                    />
                </div>
                <Tippy content={interactiveDict['search-form'][tooltip][language]}>
                    <input ref={submitButton} type='submit' value='Ok' />
                </Tippy>
            </form>
        </div>
    )
    
}
export default React.memo(SearchForm);