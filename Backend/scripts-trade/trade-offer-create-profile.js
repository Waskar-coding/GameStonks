//Local schemas
const User = require('../schemas/schema-user');

//Local modules
const checkCash = require('./scripts-trade-check/trade-check-cash');
const checkOfferValue = require('./scripts-trade-check/trade-check-offer-value');
const tradePackage = require('./scripts-trade-packages/trade-package');

//Post offer out function
const postOfferOut = (offerId, myUser, otherUser, tradeOffer) => {
    /*
    Updates the user that made the offer
    */
    const { offerDate, offerTypeOut, offerTypeIn, offerValueOut, offerValueIn } = tradeOffer;
    return new Promise(resolve => {
        User.findOneAndUpdate(
            {steamid: myUser.steamid},
            {
                $push: {
                    general_timeline: Array([
                        new Date(),
                        'T',
                        `Offer-out-${offerTypeOut}-${offerTypeIn}`,
                        offerValueOut,
                        otherUser.name,
                        offerValueIn
                    ]),
                    my_offers: {
                        offer_id: offerId,
                        offer_user_id: otherUser.steamid,
                        offer_user_name: otherUser.name,
                        offer_user_thumbnail: otherUser.thumbnail,
                        offer_date: offerDate,
                        offer_type_out: offerTypeOut,
                        offer_value_out: offerValueOut,
                        offer_type_in: offerTypeIn,
                        offer_value_in: offerValueIn
                    }
                }
            },
            {new: true}
        )
            .then(newMyUser => resolve(newMyUser))
            .catch(() => resolve(null))
    })
}

//Post offer in function
const postOfferIn = (offerId, otherUser, myUser, tradeOffer) => {
    /*
    Updates the use that received the offer
    */
    const { offerDate, offerTypeIn, offerValueIn, offerTypeOut, offerValueOut } = tradeOffer;
    return new Promise(resolve => {
        User.findOneAndUpdate(
            {steamid: otherUser.steamid},
            {
                $push: {
                    general_timeline: Array([
                        new Date(),
                        'T',
                        `Offer-in-${offerTypeOut}-${offerTypeIn}`,
                        myUser.name,
                        offerValueOut,
                        offerValueIn
                    ]),
                    user_offers: {
                        offer_id: offerId,
                        offer_user_id: myUser.steamid,
                        offer_user_name: myUser.name,
                        offer_user_thumbnail: myUser.thumbnail,
                        offer_date: offerDate,
                        offer_type_in: offerTypeOut,
                        offer_value_in: offerValueOut,
                        offer_type_out: offerTypeIn,
                        offer_value_out: offerValueIn
                    }
                }
            },
            {new: true}
        )
            .then(newOtherUser => resolve(newOtherUser))
            .catch(() => resolve(null))
    })
}

//Main function
module.exports = (req, otherUser) => {
    const { tradeOffer } = req.body;
    const myId = req.user.user.steamid;
    const otherId = req.body.userId
    return new Promise(resolve => {
        /*
        Starts by checking for bad cash queries (negative values, non-numbers ...)
        if the query is not valid the request is denied and no further actions are
        required
        */
        if(checkCash(tradeOffer) === false){
            resolve({status: 403, message: "Bad cash query"});
            return;
        }
        User.findOne({steamid: myId})
            .then(async myUser => {
                /*
                Only one offer to the same
                user is allowed at the time
                */
                if(myUser.my_offers.some(offer => offer.offer_id.split('_')[1] === otherId) === true){
                    resolve({status: 403, message: "Only one pending offer is allowed for each user"});
                    return;
                }
                /*
                The trade values and types have to
                be checked according to their type
                */
                const myCheck = checkOfferValue(myUser, tradeOffer.offerTypeOut, tradeOffer.offerValueOut);
                const otherCheck = checkOfferValue(otherUser, tradeOffer.offerTypeIn, tradeOffer.offerValueIn);
                if((await myCheck === false) || (await otherCheck === false)){
                    resolve(tradePackage(req, otherUser, 500, false, offerId));
                    return;
                }
                /*
                If the offer is possible an offer id is
                created and both profiles are notified
                */
                const offerId = `${myUser.steamid}_${otherUser.steamid}_${Date.now()}`;
                const myUpdatedUser = await postOfferOut(offerId, myUser, otherUser, tradeOffer);
                const otherUpdatedUser = await postOfferIn(offerId, otherUser, myUser, tradeOffer);
                if((myUpdatedUser === null) || (otherUpdatedUser === null)){
                    resolve(tradePackage(req, otherUser, 500, false, offerId));
                    return;
                }
                /*
                If no server errors occur while updating
                both profiles the tradeOffer is sent back
                */
                resolve(tradePackage(req, otherUpdatedUser, 201, false, offerId));
            })
            .catch(() => resolve({status: 500, message: "Internal server error"}))
    });
}