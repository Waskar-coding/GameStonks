//Standard
import React, {useContext} from "react";

//Local components
import DefaultAPIGet from "../../../api-interaction/default-api-get";
import EventOfferCreateCurrent from "../create/event-offer-create-current";
import EventOfferCreateForm from "./event-offer-create-form";
import withDefaultLoadError from "../../../api-interaction/with-default-load-&-error";

//Custom hooks
import useApiCallback from "../../../my-hooks/hook-api-callback";

//Context
import BasicProfileContext from "../../../context/profile-basic-context";

//Component reducer
const offerReducer = (state, action) => {
    console.log(action);
    switch(action.type){
        case 'create': return { loading: false, currentOffer: action.payload, error: null}
        case 'delete': return { loading: false, currentOffer: null, error: null }
        case 'error': return { loading: false, currentOffer: state.currentOffer, error: "Internal server error" }
        case 'load': return { ...state, loading: true }
        default: return state;
    }
}

//Main function
const EventOfferCreate = ({eventId}) => {
    /*
    COVERS THE BUSINESS LOGIC OF POSTING
    AND OFFER WITHIN AN EVENT

    Unpacking context
    */
    const { isAuth, userName, userThumbnail } = useContext(BasicProfileContext);
    const myBasic = {
        userName: userName,
        userThumbnail: userThumbnail
    }
    /*
    If the user is not authenticated
    a message is returned
    */
    if(isAuth === false) return(
        <div>You must be authenticated and participating in the event to post offers</div>
    )
    /*
    If the user is authenticated the
    API for event personal registers
    will be called (it can be recycled
    for this purpose) to get information
    on the state of the user within the
    event
    */
    return(
        withDefaultLoadError(
            DefaultAPIGet,
            apiData => {
                return(
                    <InnerEventOfferCreate
                        eventId={eventId}
                        myBasic={myBasic}
                        apiData={apiData.state}
                    />
                )
            },
            `/events/${eventId}/private/personal`,
            "default",
            {500:"event-personal-500", 403:"event-personal-403"}
        )
    )
}
export default EventOfferCreate;

//Inner component
const InnerEventOfferCreate = ({apiData, eventId, myBasic}) => {
    /*
    Unpacking API data and
    creating state
    */
    const { register, wealth, multipliers, handshakeEvents } = apiData;
    const [ offer, setOffer ] = useApiCallback(
        offerReducer,
        {
            loading: false,
            currentOffer: register.offer? register.offer : null,
            error: null
        }
    );
    console.log(offer);
    if(offer.loading === true) return <div>Loading ...</div>
    /*
    The API for the event's personal component
    can be recycled because it also determines
    whether there is an event register. If the
    event register does not exist the API returns
    null, and a message is rendered.
     */
    if(!register) return(
        <div>You ar not participating</div>
    )
    /*
    If he user has been kicked a
    message is returned
    */
    else if(register.status === 'k') return(
        <div>You were kicked from this event</div>
    )
    /*
    If the register informs of a current
    offer being posted in the event the
    EventOfferCreatorCurrent component
    will be returned
    */
    else if(offer.currentOffer !== null) return(
        <EventOfferCreateCurrent
            offer={offer.currentOffer}
            dropOffer={() => setOffer(
                {
                    reducerMethod: 'delete',
                    apiMethod: 'delete',
                    apiUrl: '/trade/delete_event',
                    apiPayload: {
                        eventId: eventId
                    }
                }
            )}
            myBasic={myBasic}
        />
    )
    /*
    If the user is participating has not
    created an offer yet, therefore the
    offer creator component is rendered
     */
    else return(
            <EventOfferCreateForm
                eventId={eventId}
                error={offer.error}
                createOffer={values => setOffer({
                    reducerMethod: 'create',
                    apiMethod: 'post',
                    apiUrl: '/trade/create_event',
                    apiPayload: {
                        eventId: eventId,
                        ...values
                    }
                })}
                myTradeData={{
                    ...myBasic,
                    userName: "You offer this item:",
                    wealth: wealth,
                    multipliers: multipliers,
                    handshakeEvents: handshakeEvents
                }}
            />
        )
}