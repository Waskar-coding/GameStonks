//Standard
import React from "react";

//Local components
import EventOfferDisplay from "../display/event-offer-display";

//Main function
const EventOfferCreateCurrent = ({offer, dropOffer, myBasic}) => {
    /*
    Wraps the component EventOfferDisplay
    with the parameters of the user's own
    offer in the event. Also includes a drop
    button that deletes the offer on the top
    level
    */
    return (
        <div>
            <EventOfferDisplay
                isMyOffer={true}
                leftBasic={myBasic}
                leftType={offer.offerTypeOut}
                leftValue={offer.offerValueOut}
                rightType={offer.offerTypeIn}
                rightValue={offer.offerValueIn}
                offerDate={offer.offerDate}
            />
            <button onClick={() => dropOffer()}>
                Drop this offer
            </button>
        </div>
    )
}
export default EventOfferCreateCurrent;