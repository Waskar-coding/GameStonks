//Standard
import React from "react";

//Main function
const OfferList = ({offers, currentOffer, setCurrentOffer}) => {
    return (
        <>
            {offers.map(offer =>
                <div key={offer.offer_id} onClick={() => setCurrentOffer(offer)}>
                    {currentOffer !== null? (
                        <div style={{backgroundColor: currentOffer.offer_id === offer.offer_id? 'yellow' : 'white'}}>
                            <InnerOffer offer={offer} />
                        </div>
                    ) : (
                        <div>
                            <InnerOffer offer={offer} />
                        </div>
                    )}

                </div>
            )}
        </>
    )
}
export default OfferList;

const InnerOffer = ({offer}) => {
    return(
        <div style={{display: "flex"}}>
            <img weight="50" height="50" src={offer.offer_user_thumbnail} alt="user_offer_thumbnail" />
            <div style={{margin: "5px", flex: "30$"}}>{offer.offer_user_name}</div>
            <div style={{margin: "5px", flex: "30$"}}>{offer.offer_date}</div>
        </div>
    )
}