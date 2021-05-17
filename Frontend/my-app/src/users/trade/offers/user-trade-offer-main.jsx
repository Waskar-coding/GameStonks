//Standard
import React, {useContext, useReducer} from "react";

//Local modules
import CurrentOffer from "./user-trade-offer-current";
import OfferList from "./user-trade-offer-list";

//Context
import TransactionContext from "../../../context/transaction-context";

//Offer reducer
const offerReducer = (state, action) => {
    const { currentOffer, myOffers, userOffers } = state;
    switch(action.type){
        case "current":
            return {
                ...state,
                currentOffer: action.payload
            }
        case "drop":
            return {
                ...state,
                currentOffer: null,
                myOffers: myOffers.filter(offer => offer.offer_id !== currentOffer.offer_id)
            }
        case "accept":
        case "decline":
            return {
                ...state,
                currentOffer: null,
                userOffers: userOffers.filter(offer => offer.offer_id !== currentOffer.offer_id)
            }
        case "error":
            return {
                ...state,
                currentOffer: null,
                error: action.payload
            }
        default:
            return state;
    }
}

//Main function
const Offer = () => {
    const { profile } = useContext(TransactionContext);
    const { myOffers, userOffers } = profile;
    const [ offerState, setOfferState ] = useReducer(
        offerReducer,
        { myOffers: myOffers, userOffers: userOffers, currentOffer: null, error: null },
        () => { return { myOffers: myOffers, userOffers: userOffers, currentOffer: null, error: null } }
    );
    if((myOffers.length === 0) && (userOffers.length === 0)) return <div>No offers found</div>
    return (
        <div>
            <div style={{display: "flex"}}>
                <div style={{flex: "50%"}}>
                    <OfferList
                        offers={offerState.myOffers}
                        currentOffer={offerState.currentOffer}
                        setCurrentOffer={(offer) => setOfferState({type: "current", payload: offer})}
                    />
                </div>
                <div style={{flex: "50%"}}>
                    <OfferList
                        offers={offerState.userOffers}
                        currentOffer={offerState.currentOffer}
                        setCurrentOffer={(offer) => setOfferState({type: "current", payload: offer})}
                    />
                </div>
            </div>
            <CurrentOffer
                currentOffer={offerState.currentOffer}
                setOffers={(actionObject) => setOfferState(actionObject)}
            />
        </div>
    )
}
export default Offer;