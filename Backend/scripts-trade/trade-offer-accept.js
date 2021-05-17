//Local schemas
const User = require('../schemas/schema-user');

//Local modules
const checkOfferId = require('./scripts-trade-check/trade-check-offer-id');
const checkOfferValue = require('./scripts-trade-check/trade-check-offer-value');
const transferMain = require('./scripts-trade-transfer/trade-transfer-main');
const tradePackage = require('./scripts-trade-packages/trade-package');

//Main function
module.exports = (req, otherUser) => {
    const today = new Date();
    const myId = req.user.user.steamid;
    const offerId = req.body.offerId;
    return new Promise(resolve => {
        /*
        Starts by checking if the user can actually accept the offer,
        if the offer does not contain the user's id as  the second
        part of its id that means this offer is not aimed to them,
        and  therefore the user cannot accept it
        */
        if(offerId.split('_')[1] !== myId){
            resolve({status: 403, message: "Bad query"});
            return;
        }
        User.findOne({steamid: myId})
        .then(async myUser => {
            /*
            The offer must exists in the database instance of both parties
            (each offer must be on its corresponding field)
            */
            let {status, myOffer} = checkOfferId(
                myUser, otherUser, 'user_offers', 'my_offers', offerId
            );
            /*
            If the offer exists it needs to be erased from
            both instances, whether it is valid or expired
            */
            myUser.user_offers = myUser.user_offers.filter(offer => offer.offer_id !== offerId);
            otherUser.my_offers = otherUser.my_offers.filter(offer => offer.offer_id !== offerId);
            /*
            If the offer does not exists the other user must
            have declined the offer or has already accepted
            it, in this case the functions stops right here
            without a transaction or a notification and both
            list and graph timelines (plus the graph points)
            are updated.
            */
            if(status === 404){
                myUser.save().then(async newMyUser =>
                    resolve(await tradePackage(req, newMyUser, status, true))
                );
                return;
            }
            const {offer_type_out, offer_type_in, offer_value_out, offer_value_in} = myOffer;
            /*
            Next the values are checked to see if the both parties
            still meet the necessary conditions for the trade
            */
            const myCheck = checkOfferValue(myUser, offer_type_out, offer_value_out);
            const otherCheck = checkOfferValue(otherUser, offer_type_in, offer_value_in);
            /*
            If at least one of them does not meet the trade conditions
            the offer is deemed as expired and both users are notified
            accordingly
            */
            if((await myCheck === false) || (await otherCheck === false)){
                myUser.general_timeline.push(
                    [
                        today, 'T', `Expired-in`, otherUser.name
                    ]
                );
                otherUser.general_timeline.push(
                    [
                        today, 'T', `Expired-out`, myUser.name
                    ]
                );
                myUser.save().then(newMyUser =>
                    otherUser.save().then(async() =>
                        resolve(await tradePackage(req, newMyUser, 410, true))
                    )
                );
                return;
            }
            /*
            Finally if the users meet the trade conditions they are
            notified accordingly, and finally the transference is
            carried out for both users
            */
            myUser.general_timeline.push(
                [
                    today, 'T', `Accept-${offer_type_out}-${offer_type_in}`,
                    offer_value_out, offer_value_in, otherUser.name
                ]
            );
            otherUser.general_timeline.push(
                [
                    today, 'T', `Accept-${offer_type_in}-${offer_type_out}`,
                    offer_value_in, offer_value_out, myUser.name
                ]
            );
            transferMain(myUser, otherUser, offer_type_out, offer_value_out)
            .then(tResponse1 => {
                if(tResponse1.status !== 200) return new Promise(resolve => resolve({status: 500}));
                return transferMain(tResponse1.otherUser, tResponse1.myUser, offer_type_in, offer_value_in);
            })
            .then(tResponse2 => {
                if(tResponse2.status !== 200){
                    resolve({status: 500});
                    return;
                }
                return tResponse2.myUser.save().then(() => tResponse2.otherUser.save())
            })
            .then( async newMyUser =>
                resolve(await tradePackage(req, newMyUser, 200, true))
            )
        })
        .catch((err) => resolve({status: 500}))
    });
}