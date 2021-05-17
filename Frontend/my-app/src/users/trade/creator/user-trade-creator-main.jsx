//Standard
import React, { useContext, useState } from "react";

//Local components
import DefaultAPIGet from "../../../api-interaction/default-api-get";
import withDefaultLoadError from "../../../api-interaction/with-default-load-&-error";
import TradeCreatorCurrent from "./user-trade-creator-current";
import TradeCreatorError from "./user-trade-creator-error";
import UserTradeCreatorForm from "./user-trade-creator-form";
import TradeCreatorModals from "./user-trade-creator-modals";

//Context
import BasicProfileContext from "../../../context/profile-basic-context";
import TransactionContext from "../../../context/transaction-context";

//Main function
const OfferCreator = () => {
    /*
    Unpacking context
    */
    const { userId } = useContext(TransactionContext);
    const { isAuth } = useContext(BasicProfileContext);
    /*
    If the user is not authenticated
    trade options are not available
    */
    if(isAuth === false) return <div>You must be authenticated to trade</div>
    /*
    If any of the trade data is not
    provided an API call is necessary
    */
    return(
        withDefaultLoadError(
            DefaultAPIGet,
            InnerOfferCreator,
            `/trade/trade_data?userId=${userId}`,
            "default",
            {500: "trade-data-500"}
        )
    )
}
export default OfferCreator;

//Inner offer creator
const InnerOfferCreator = ({state}) => {
    /*
    Unpacking props and context
    */
    const [ currentOffer, setCurrentOffer ] = useState(state.currentOffer);
    const [ newOffer, setNewOffer ] = useState(null);
    return(
        <>
            <InnerOfferMain
                currentOffer={currentOffer}
                setCurrentOffer={setCurrentOffer}
                setNewOffer={setNewOffer}
                state={state}
            />
            {(currentOffer === null) && (newOffer !== null) &&
                <TradeCreatorModals
                    newOffer={newOffer}
                    setNewOffer={setNewOffer}
                    setCurrentOffer={setCurrentOffer}
                />
            }
        </>
    )
}

//Inner offer main
const InnerOfferMain = ({currentOffer, setCurrentOffer, setNewOffer, state}) => {
    const { myTradeData, userTradeData, err } = state;
    /*
    You can only hold one offer with the user if
    there is a pending offer it will be displayed
    along with the option to drop it
    */
    if(currentOffer !== null){
        return(
            <TradeCreatorCurrent
                currentOffer={currentOffer}
                setCurrentOffer={setCurrentOffer}
                userTradeData={userTradeData}
            />
        )
    }
    /*
    In case the any limit of offers has been reached
    or not offers are possible a message will appear
    */
    else if(err !== null){
        return(
            <TradeCreatorError
                tradeError={err}
            />
        )
    }
    /*
    If none of the previous conditions
    are given the create offer form is
    displayed
    */
    else{
        return(
            <UserTradeCreatorForm
                myTradeData={myTradeData}
                userTradeData={userTradeData}
                setNewOffer={setNewOffer}
            />
        )
    }
}