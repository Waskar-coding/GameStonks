//Standard
import React, {useContext} from "react";

//Local components
import TradeForm from "../../../trade/trade-form-main";

//Useful functions
import getInitial from "../../../trade/trade-form-initial";
import getOptions from "../../../trade/trade-form-options";

//Context
import TransactionContext from "../../../context/transaction-context";

//Main function
const UserTradeCreatorForm = ({ myTradeData, userTradeData, setNewOffer }) => {
    /*
    WRAPS THE DISPLAY COMPONENT "TradeForm" WITH
    YOUR DATA AND THE USER YOU DECIDED TO TRADE
    WITH.

    Unpacking context
    */
    const { list } = useContext(TransactionContext);
    /*
    We start by determining which types
    of items can each party trade according
    to their data
    */
    const myTradeOptions = getOptions(myTradeData);
    const userTradeOptions = getOptions(userTradeData);
    /*
    Taking into account the trade options
    of both parties we create initial values
    for each user
    */
    const myInitValue = getInitial(myTradeOptions[0], myTradeData);
    const userInitValue = getInitial(userTradeOptions[0], userTradeData);
    return(
        <TradeForm
           myTradeOptions={myTradeOptions}
           userTradeOptions={userTradeOptions}
           myTradeData={myTradeData}
           userTradeData={userTradeData}
           initialValues={{
               offerTypeOut: myTradeOptions[0],
               offerTypeIn: userTradeOptions[0],
               offerValueOut: myInitValue,
               offerValueIn: userInitValue
           }}
           submitFunction={(values, actions) => {
               setNewOffer({
                   userId: userTradeData.userId,
                   tradeOffer: {
                       ...values,
                       offerDate: new Date()
                   },
                   startDateList: list.startDate,
                   finalDateList: list.finalDate
               })
               actions.setSubmitting(false);
           }}
        />
    )
}
export default UserTradeCreatorForm;