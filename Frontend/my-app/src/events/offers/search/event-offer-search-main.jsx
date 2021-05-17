//Standard
import React, {useContext} from "react";

//Packages
import { Formik } from "formik";
import queryString from "query-string";

//Local components
import DefaultAPIGet from "../../../api-interaction/default-api-get";
import EventOfferDisplay from "../display/event-offer-display";
import EventOfferSearchFilter from "./event-offer-search-filter";
import SearchItemList from "../../../search/search-item-list";
import SearchList from "../../../search/search-list";
import withDefaultLoadError from "../../../api-interaction/with-default-load-&-error";

//Language jsons
import interactiveDict from "../../../language-display/interactive-classifier.json";

//Context
import BasicProfileContext from "../../../context/profile-basic-context";
import LanguageContext from "../../../context/language-context";

//Main function
const WrappedEventOfferSearch = ({eventId}) => {
    const language = useContext(LanguageContext);
    const { isAuth } = useContext(BasicProfileContext);
    const initialTypes = [ 'cash', 'multiplier', 'handshake' ];
    const { filter_type_out, filter_type_in } = queryString.parse(window.location.toString());
    const initialTypeOut = filter_type_out? 
        (filter_type_out.includes(',')? filter_type_out.split(',') : [filter_type_out]) : initialTypes;
    const initialTypeIn = filter_type_in?
        (filter_type_in.includes(',')? filter_type_in.split(',') : [filter_type_in]) : initialTypes;
    return(
        <Formik
            initialValues={{
                offerTypeOut: initialTypeOut,
                offerTypeIn: initialTypeIn
            }}
            validate={values => {
                const { offerTypeOut, offerTypeIn } = values;
                const { sort, order, search } = queryString.parse(window.location.toString());
                const newPage = 1;
                const newSort = sort? sort : 'date';
                const newOrder = order? order : '1';
                const newSearch = search? search : '';
                window.history.pushState(
                    {
                        sort: newSort,
                        order: newOrder,
                        page: newPage,
                        search: newSearch,
                        filter_type_out: offerTypeOut,
                        filter_type_in: offerTypeIn
                    },
                    'title 2',
                    `?sort=${newSort}&order=${newOrder}&search=${newSearch}&page=${newPage}` + '&' +
                    `filter_type_out=${offerTypeOut}&filter_type_in=${offerTypeIn}&is_auth=${isAuth}`
                );
            }}
            onSubmit={() => {}}
            validateOnChange={true}
            validateOnBlur={false}
            validateOnMount={false}
        >
            {formik =>
                <div>
                    <EventOfferSearchFilter />
                    <SearchList
                        defaultSort="date"
                        displayPerPage = "3"
                        message="event-offer-message"
                        placeholder="event-offer-placeholder"
                        tooltip="event-offer-tooltip"
                        notFound="event-offer-404"
                        options={JSON.stringify({
                            name: interactiveDict['search-form']['event-offer-name'][language],
                            date: interactiveDict['search-form']['event-offer-date'][language]
                        })}
                    >
                        <EventOfferSearchMain
                            eventId={eventId}
                            filterOut={formik.values.offerTypeOut}
                            filterIn={formik.values.offerTypeIn}
                            isAuth={isAuth}
                        />
                    </SearchList>
                </div>
            }
        </Formik>
    )
}
export default React.memo(WrappedEventOfferSearch);

const EventOfferSearchMain = React.memo(({eventId, filterOut, filterIn, sort, order, search, page, isAuth}) => {
    return(
        withDefaultLoadError(
            DefaultAPIGet,
            EventOfferList,
            '/trade/find' +
            `/${eventId}` + '?' +
            'sort=start&order=1' + '&' +
            `inner_sort=${sort}&inner_order=${order}` + '&' +
            `search=${search}&page=${page}` + '&' +
            `filter_type_out=${filterOut}&filter_type_in=${filterIn}` + '&' +
            `is_auth=${isAuth}`,
            "default",
            {500: "event-offer-search-500", 404: "event-offer-search-404"}
        )
    )
})

const EventOfferList = ({state}) =>
    <SearchItemList
        state={state}
        notFound="event-offer-search-404"
        idName="offer_id"
        ItemElement={EventOffer}
    />

const EventOffer = ({item}) =>
    <EventOfferDisplay
        isMyOffer={false}
        leftBasic={{
            userName: `${item.offer_user_name} offers:`,
            userThumbnail: item.offer_user_thumbnail
        }}
        leftType={item.offer_type_out}
        leftValue={item.offer_value_out}
        rightType={item.offer_type_in}
        rightValue={item.offer_value_in}
        offerDate={item.offer_date}
    />

