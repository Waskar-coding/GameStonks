//Standard
import React, {useContext, useState} from "react";

//Packages
import axios from "axios";

//Local modules
import Transaction from "../../../display-components/transaction";

//Context
import TransactionContext from "../../../context/transaction-context";
import BasicProfileContext from "../../../context/profile-basic-context";
import DefaultAPIPost from "../../../api-interaction/default-api-post";

//Current offer display
export const CurrentOfferDisplay = ({currentOffer, isMyOffer}) => {
    console.log(currentOffer);
    const myUser = useContext(BasicProfileContext);
    const {
        offer_user_name, offer_user_thumbnail, offer_type_in,
        offer_type_out, offer_value_in, offer_value_out
    } = currentOffer;
    const otherUser = {
        userName: offer_user_name,
        userThumbnail: offer_user_thumbnail
    };
    const [leftUser, leftType, leftValue, rightUser, rightType, rightValue] = isMyOffer?
        [myUser, offer_type_out, offer_value_out, otherUser, offer_type_in, offer_value_in] :
        [otherUser, offer_type_in, offer_value_in, myUser, offer_type_out, offer_value_out] ;
    return(
        <div>
            <Transaction myBasic={leftUser} userBasic={rightUser} />
            <div style={{display:"flex"}}>
                <div style={{flex: "50%"}}>
                    <div>Type: {leftType}</div>
                    <div>Value: {leftValue}</div>
                </div>
                <div style={{flex: "50%"}}>
                    <div>Type: {rightType}</div>
                    <div>Value: {rightValue}</div>
                </div>
            </div>
        </div>
    )
}

//Main function
const CurrentOffer = ({currentOffer, setOffers}) => {
    //User and transaction context
    const myUser = useContext(BasicProfileContext);
    const {
        list, graph, profile,
        setList, setGraph, setProfile
    } = useContext(TransactionContext);
    
    //Display accept modal
    const [ display, setDisplay ] = useState(false);

    //If offer is null nothing is displayed
    if(currentOffer === null) return <div>No offer selected</div>

    //Unpacking current offer
    const offerId = currentOffer.offer_id;
    const userId = currentOffer.offer_user_id;

    //Checking if offer is users's and determining action type
    const isMyOffer = offerId.split('_')[0] === myUser.userId;
    const actionType = isMyOffer? "drop" : "decline";
    
    //
    const updateOfferState = res => {
        setOffers({type: actionType});
        setList({
            ...list,
            timeline: res.newListTimeline
        });
        setGraph({
            ...graph,
            timeline: res.newGraphTimeline,
            points: res.newGraphPoints
        });
        setProfile({
            ...profile,
            multipliers: res.newMultipliers,
            wealth: res.newWealth,
            events: res.newEvents
        })
    }
    
    //Date params
    const defaultParams = {
        offerId: offerId,
        startDateList: list.startDate,
        finalDateList: list.finalDate,
        startDateGraph: graph.startDate,
        finalDateGraph: graph.finalDate,
        isPersonal: true
    }

    //Rendering
    return (
        <div>
            <CurrentOfferDisplay
                currentOffer={currentOffer}
                isMyOffer={isMyOffer}
            />
            {isMyOffer === false && 
                <button onClick={() => setDisplay(true)}>
                    Accept
                </button>
            }
            <button onClick={() => {
                axios.delete(
                    '/trade/delete_profile',
                    {
                        data: {
                            action: actionType,
                            userId: userId,
                            ...defaultParams,
                            isPersonal: true
                        }
                    }
                )
                .then(res => updateOfferState(res.data))
                .catch(() => {
                    axios.delete(
                        '/trade/fast_delete',
                        {
                            data:{
                                action: actionType,
                                ...defaultParams,
                                isPersonal: true
                            }
                        }
                    )
                    .then(res => updateOfferState(res.data))
                    .catch(err => setOffers({type: 'error', payload: err}))
                })
            }}>
                {isMyOffer? "Drop" : "Decline"}
            </button>
            {display === true && 
                <DefaultAPIPost
                    confirm={() => 
                        <div>
                            <CurrentOfferDisplay currentOffer={currentOffer} />
                            <div>U sure?</div>
                        </div>    
                    }
                    success={apiData => {
                        console.log('success');
                        console.log(apiData);
                        switch(apiData.status){
                            case 200: return <div>Offer accepted</div>
                            case 404: return <div>The other user dropped the offer</div>
                            case 410: return <div>Users no longer meet the conditions for this exchange</div>
                            default: return <div>Internal server error</div>
                        }
                    }}
                    error={apiStatus => {
                        switch(apiStatus){
                            case 404: return <div>User deleted account</div>
                            default: return <div>Internal server error</div>
                        }
                    }}
                    url="/trade/accept"
                    requestBody={{userId: userId, ...defaultParams}}
                    loadMessage="default"
                    toParentClose={() => setDisplay(false)}
                    confirmButton="Accept"
                    updateFunction={apiData => updateOfferState(apiData)}
                    method="put"
                />
            }
        </div>
    )
}
export default CurrentOffer;