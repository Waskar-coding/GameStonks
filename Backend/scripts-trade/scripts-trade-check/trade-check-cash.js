//Check cash
const checkCash = (offerType, offerValue) => {
    /*
    Checks for bad queries if the offer type is cash
    */
    if(offerType === 'cash'){
        if(isNaN(offerValue)) return false;
        else if(offerValue <= 0) return false;
    }
    return true;
}

//Main function
module.exports = (tradeOffer) => {
    /*
    Checks for bad cash queries in both users
    */
    const { offer_type_out, offer_value_out, offer_type_in, offer_value_in } = tradeOffer;
    return checkCash(offer_type_out, offer_value_out) && checkCash(offer_type_in, offer_value_in);
}