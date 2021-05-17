//Standard
import React from "react";

//Local components
import TradeForm from "../../../trade/trade-form-main";

//Useful functions
import getInitial from "../../../trade/trade-form-initial";
import getOptions from "../../../trade/trade-form-options";

//Constants
const AVAILABLE_MULTIPLIERS = ['bronze', 'silver', 'golden', 'handshake'];

//Main function
const EventOfferCreateForm = ({eventId, error, myTradeData, createOffer}) => {
    /*
    PASSES TO THE DISPLAY COMPONENT "TradeForm"
    THE PARAMETERS TO POST AN OFFER WITHIN AN EVENT

    Determining user's trade options
    */
    const myTradeOptions = getOptions(myTradeData);
    if(myTradeOptions.length === 0) return <div>No trade options</div>
    return(
        <div>
            <TradeForm
                myTradeOptions={myTradeOptions}
                userTradeOptions={['cash', 'multiplier']}
                myTradeData={myTradeData}
                userTradeData={{
                    userName: "You are looking for this item:",
                    userThumbnail: "https://steamuserimages-a.akamaihd.net/ugc/868480752636433334/1D2881C5C9B3AD28A1D8852903A8F9E1FF45C2C8/",
                    wealth: 1e10,
                    multipliers: AVAILABLE_MULTIPLIERS,
                    handshakeEvents: []
                }}
                initialValues={{
                    offerTypeOut: myTradeOptions[0],
                    offerValueOut: getInitial(myTradeOptions[0], myTradeData),
                    offerTypeIn: 'cash',
                    offerValueIn: 0
                }}
                submitFunction={values =>
                    createOffer({
                        eventId: eventId,
                        ...values
                    })
                }
            />
            <div>{error !== null && error}</div>
        </div>
    )
}
export default EventOfferCreateForm;