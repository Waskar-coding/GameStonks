//Standard
import React from "react";

//Main function
const TradeCreatorError = ({tradeError}) => {
    switch(tradeError){
        case "my-empty": return <div>You don't have nothing to trade with</div>
        case "user-empty": return <div>User does not have nothing to trade with</div>
        case "my-max-offers": return <div>You have reached your maximum number of pending offers</div>
        case "user-max-offers": return <div>User has too many pending offers</div>
        default: return <div>Internal server error</div>
    }
}
export default TradeCreatorError;