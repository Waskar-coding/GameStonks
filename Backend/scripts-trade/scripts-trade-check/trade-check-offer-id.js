//Main function
module.exports = (myUser, otherUser, myField, otherField, offerId) => {
    /*
    Checks if a trade offer with a given
    offerId exists in both parties on their
    respective fields
    */
    const myOffer = myUser[myField].filter(offer => offer.offer_id === offerId).pop();
    const otherOffer = otherUser[otherField].filter(offer => offer.offer_id === offerId).pop();
    if((!myOffer) || (!otherOffer)) return {status: 404}
    return {status: 200, myOffer: myOffer}
}