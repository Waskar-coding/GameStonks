//Standard
import React, {useContext, useState} from "react";

//Packages
import Tippy from "@tippy.js/react";
import {useHistory} from "react-router";

//Local components
import DefaultAPIGet from "../../api-interaction/default-api-get";
import DefaultAPIPost from "../../api-interaction/default-api-post";
import DefaultError from "../../error-components/default-error";
import withDefaultLoadError from "../../api-interaction/with-default-load-&-error";
import SearchItemList from "../../search/search-item-list";
import SearchList from "../../search/search-list";

//Useful functions
import configMoneyDisplay from "../../data-manipulation/config-money-display";
import processMessage from "../../language-display/process-message";

//Language jsons
import interactiveDict from "../../language-display/interactive-classifier";
import messageDict from "../../language-display/message-classifier.json";

//Context
import LanguageContext from "../../context/language-context";

//Wrapped main class
const WrappedJ01Features = ({eventId, location}) => {
    const language = useContext(LanguageContext);
    return(
        <SearchList
            defaultSort="name"
            displayPerPage = "8"
            message="j01-message"
            placeholder="j01-placeholder"
            tooltip="j01-tooltip"
            options={JSON.stringify({
                name: interactiveDict['search-form']['j01-name'][language],
                release: interactiveDict['search-form']['j01-release'][language]
            })}
            location={location}
        >
            <InnerJ01Features eventId={eventId} />
        </SearchList>
    )
}
export default WrappedJ01Features;

//Inner main class
const InnerJ01Features = ({eventId, sort, order, search, page}) => {
    return(
        withDefaultLoadError(
            DefaultAPIGet,
            ProductList,
            `/events/${eventId}/public/features?sort=${sort}&order=${order}&search=${search}&page=${page}`,
            "features-search",
            {500: "features-search-500", 404: "features-search-404", 403: "features-search-403"}
        )
    )

}

//Product list
const ProductList = ({state}) => {
    return(<SearchItemList state={state} notFound="features-search-404" idName="productId" ItemElement={Product} />)
}

//Product
const Product = ({state,item}) => {
    const language = useContext(LanguageContext);
    const history = useHistory();
    const {isAuth, eventId} = state;
    const [display, setDisplay] = useState(0);
    return(
        <div>
            <div><img src={item.thumbnail} alt={item.name} /></div>
            <div>{item.name}</div>
            <div>{item.release.split('T')[0]}</div>
            <Tippy content={interactiveDict['event-tooltips']['steamcharts-link'][language]}>
                <a href={`https://steamcharts.com/app/${item.productId}`} target="_blank" rel="noopener noreferrer" >
                    <img width="40" src={require('./steamcharts-link.png')} alt="steamcharts_link"/>
                </a>
            </Tippy>
            <Tippy content={interactiveDict['event-tooltips']['steamstore-link'][language]}>
                <a
                    href={`https://store.steampowered.com/app/${item.productId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img width="130" src={require('./steamstore-link.png')} alt="steamstore_link" />
                </a>
            </Tippy>
            {isAuth &&
                <div>
                    {item.monitored ? (
                        messageDict['error']['features-monitored'][language]
                    ) : (
                        <Tippy content={interactiveDict['J01-features']['J01-register-tooltip'][language]}>
                            <button onClick={() => {setDisplay(100)}}>
                                {interactiveDict['J01-features']['J01-register-tooltip'][language]}
                            </button>
                        </Tippy>
                    )}
                </div>
            }
            {state.isAuth && display!==0 && !item.monitored &&
                <DefaultAPIPost
                    confirm={() => {
                        const confirmMessage = processMessage(
                            language, ["confirmation","J01-post-confirm", item.name]
                        );
                        return(
                            <div>
                                <img src={item.thumbnail} alt="product_thumbnail" />
                                <div>{confirmMessage}</div>
                            </div>
                        )
                    }}
                    success={apiData => {
                        switch(apiData.status){
                            case 'kicked':
                            case 'banned':
                                window.location = `http://localhost:3000/events/${eventId}/features`;
                                return null;
                            default:
                                const share = configMoneyDisplay(apiData.newShare);
                                const successMessage= processMessage(
                                    language, ["success", "j01-post-success", item.name, share]
                                );
                                return(
                                    <div>
                                        <img src={item.thumbnail} alt="product_thumbnail" />
                                        <div>{successMessage}</div>
                                    </div>
                                )
                        }
                    }}
                    error={apiStatus => {
                        return(<DefaultError apiStatus={apiStatus} errorDict={{500: "features-500"}}/>)
                    }}
                    url={`/events/${eventId}/private/post`} requestBody={{productId: item.productId}}
                    loadMessage="features-post" toParentClose={() => {setDisplay(0)}}
                    confirmButton={interactiveDict["confirm-modal"]["event-post"][language]}
                    updateFunction={apiData => {history.go(0)}}
                />
            }
        </div>
    )
}