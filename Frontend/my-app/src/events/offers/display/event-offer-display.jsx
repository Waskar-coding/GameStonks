//Standard
import React from "react";

//Local components
import DisplayOffer from "../../../display-components/display-offer";

//Main function
const EventOfferDisplay = (
    {
        isMyOffer, leftBasic,
        leftType, rightType,
        leftValue, rightValue,
        message, offerDate
    }
) => {
    /*
    WRAPS THE DISPLAY COMPONENT
    "DisplayOffer" TO PASS THE
    APPROPRIATE PARAMETERS FOR
    AND EVENT OFFER

    Starts by creating a right
    basic profile for a placeholder
    */
    const rightBasic = {
        userName: isMyOffer? "You are looking for this item:" : "Is looking for this item:",
        userThumbnail: "https://steamuserimages-a.akamaihd.net/ugc/868480752636433334/1D2881C5C9B3AD28A1D8852903A8F9E1FF45C2C8/"
    }
    return (
        <DisplayOffer
            leftBasic={leftBasic}
            rightBasic={rightBasic}
            leftType={leftType}
            rightType={rightType}
            leftValue={leftValue}
            rightValue={rightValue}
            message={message}
            offerDate={offerDate}
        />
    )
}
export default EventOfferDisplay;