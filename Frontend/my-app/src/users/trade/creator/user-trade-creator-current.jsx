//Standard
import React, {useContext} from "react";

//Context
import TransactionContext from "../../../context/transaction-context";
import {CurrentOfferDisplay} from "../offers/user-trade-offer-current";
import axios from "axios";

//Main function
const TradeCreatorCurrent = ({ currentOffer, setCurrentOffer, userTradeData }) => {
    const { list, setList } = useContext(TransactionContext);
    const updateOfferState = res => {
        setCurrentOffer(null);
        setList({
            ...list,
            timeline: res.newListTimeline
        })
    }
    const defaultParams = {
        offerId: currentOffer.offer_id,
        startDateList: list.startDate,
        finalDateList: list.finalDate,
        isPersonal: false
    }
    return(
        <div>
            <CurrentOfferDisplay
                currentOffer={currentOffer}
                isMyOffer={true}
            />
            <button onClick={() => {
                axios.delete(
                    '/trade/delete_profile',
                    {
                        data: {
                            action: 'drop',
                            userId: userTradeData.userId,
                            ...defaultParams,
                            isPersonal: false
                        }
                    }
                )
                    .then(res => updateOfferState(res.data))
                    .catch(() => {
                        axios.delete(
                            '/trade/fast_delete',
                            {
                                data:{
                                    action: 'drop',
                                    ...defaultParams,
                                    isPersonal: false
                                }
                            }
                        )
                            .then(res => updateOfferState(res.data))
                            .catch(() => setCurrentOffer(null))
                    })
            }}>
                Drop
            </button>
        </div>
    )
}
export default TradeCreatorCurrent;