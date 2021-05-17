//Standard
import React from "react";

//Local components
import EventOfferCreate from "./create/event-offer-create-main";
import EventOfferSearch from "./search/event-offer-search-main";

//Main function
const EventOffer = ({eventId}) => {
    return (
        <div>
            <EventOfferCreate eventId={eventId} />
            <EventOfferSearch eventId={eventId} />
        </div>
    )
}
export default EventOffer;