//Standard
import React, {useContext} from "react";

//Local components
import DefaultAPIPost from "../../../api-interaction/default-api-post";

//Context
import TransactionContext from "../../../context/transaction-context";

//Main function
const TradeCreatorModals = ({newOffer, setNewOffer, setCurrentOffer}) => {
    /*
    COVERS THE CONFIRMATION BUSINESS LOGIC
    USED TO SEND TRADE OFFERS, INTERACTS
    WITH THE API IN THE BACKEND AND UPDATES
    THE PROFILE CONTEXT

    Unpacking context
    */
    const { list, setList } = useContext(TransactionContext);
    /*
    Function that updates
    the profile context
    */
    const updateContext = apiData => {
        setList({
            ...list,
            timeline: apiData.newListTimeline
        });
    }
    return (
        <DefaultAPIPost
            confirm={() => <div>U sure?</div>}
            success={apiData => {
                switch(apiData.status){
                    case 201:
                        return <div>Offer sent</div>
                    case 410:
                        return <div>There was been a change since the last time you refreshed, one of you (or both) no longer meet the conditions for this trade</div>
                    default: return <div>Internal server error</div>
                }
            }}
            error={() => window.location = `localhost:3000/users/profiles/${newOffer.userId}`}
            url="/trade/create_profile"
            loadMessage="default"
            requestBody={newOffer}
            toParentClose={() => setNewOffer(null)}
            confirmButton="Accept"
            updateFunction={apiData => {
                updateContext(apiData);
                if(apiData.status === 201){
                    setCurrentOffer(apiData.currentOffer);
                }
                setNewOffer(null)
            }}

        />
    )
}
export default TradeCreatorModals;