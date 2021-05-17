//Standard
import React, {useContext} from 'react';

//Packages
import {Link} from "react-router-dom";

//Local components
import DefaultAPIGet from "../api-interaction/default-api-get";
import SearchItemList from "../search/search-item-list";
import SearchList from "../search/search-list";

//Useful functions
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier";
import otherDict from "../language-display/other-classifier";

//Context
import LanguageContext from "../context/language-context";

//StyleSheets
import "./event-box.css";

//Main Function
const WrappedEventSearch = ({location}) => {
    /*
    Wraps the event list into the SearchList HOC in order to pass basic data to the API through it.
    */
    const language = useContext(LanguageContext);
    return(
        <SearchList
            defaultSort="final" displayPerPage = "2" message="event-message" placeholder="event-placeholder"
            tooltip="event-tooltip" notFound="event-404" location={location}
            options={JSON.stringify({
                final: interactiveDict['search-form']['event-end'][language],
                start: interactiveDict['search-form']['event-start'][language],
                total_value: interactiveDict['search-form']['event-value'][language]
            })}
        >
            <EventSearch />
        </SearchList>
    )
}
export default React.memo(WrappedEventSearch);

const EventSearch = React.memo(({sort, order, search, page}) => {
    const language = useContext(LanguageContext);
    return(
        withDefaultLoadError(
            DefaultAPIGet, EventList,
            `/events/find?sort=${sort}&order=${order}&search=${search}&page=${page}&language=${language}`,
            "event-search", {500: "event-search-500", 404: "event-search-404"}
        )
    )
})

const EventList = ({state}) => {
    return(<SearchItemList state={state} idName="eventId" notFound="event-search-404" ItemElement={EventBox} />)
}

const EventBox = ({state, item}) => {
    const {eventId, title, thumbnail, users, sponsor, start, final, value, status} = item;
    const language = useContext(LanguageContext);
    return(
        <Link to={`/events/${eventId}`}>
            <div className="event_box">
                <div className="event_image_outercase">
                    <div className="event_image_innercase">
                        <img src={`data:image/png;base64, ${thumbnail}`} alt="event_icon" width="170" height="170"/>
                    </div>
                </div>
                <div className="event_description_case">
                    <h1 className="event_title">{title}</h1>
                    <table className="event_description_table">
                        <tbody>
                        <tr>
                            <th style={{textAlign:"left"}}>
                                <h2>{otherDict['event']['event-users'][language]}</h2>
                            </th>
                            <th style={{textAlign:"right"}}><h2>{users}</h2></th>
                        </tr>
                        <tr>
                            <th style={{textAlign:"left"}}>
                                <h2>{otherDict['event']['event-sponsor'][language]}</h2>
                            </th>
                            <th style={{textAlign:"right"}}><h2>{sponsor}</h2></th>
                        </tr>
                        <tr>
                            <th style={{textAlign:"left"}}>
                                <h2>{otherDict['event']['event-start'][language]}</h2>
                            </th>
                            <th style={{textAlign:"right"}}><h2>{start.split('T')[0]}</h2></th>
                        </tr>
                        <tr>
                            <th style={{textAlign:"left"}}>
                                <h2>{otherDict['event']['event-final'][language]}</h2>
                            </th>
                            <th style={{textAlign:"right"}}><h2>{final.split('T')[0]}</h2></th>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="event_value_case"><h1>{value}$</h1></div>
                {state.isAuth &&
                    <div className="event_status_case">
                        <div className={status}>{otherDict['event'][status][language]}</div>
                    </div>
                }
            </div>
        </Link>
    )
}