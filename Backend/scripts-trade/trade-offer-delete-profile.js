//Local schemas
const User = require('../schemas/schema-user');

//Local modules
const checkOfferId = require('./scripts-trade-check/trade-check-offer-id');
const tradePackage = require('./scripts-trade-packages/trade-package');

//Main function
module.exports = (req, otherUser) => {
    const today = new Date();
    const myId = req.user.user.steamid;
    const { offerId, action, isPersonal } = req.body;
    /*
    Starts by selecting the notification and the fields
    to check according to the action field in req.body
    */
    const [myField, otherField, myAction, otherAction] = action === 'drop'?
        [ 'my_offers', 'user_offers', 'Drop-out', 'Drop-in' ] :
        [ 'user_offers', 'my_offers', 'Decline-out', 'Decline-in' ] ;
    return new Promise(resolve => {
        /*
        Only the user that made the offer can drop and
        only the user that was made the offer can decline,
        this is checked using the offer id. Only drop and
        decline actions are allowed
        */
        if(
            ((action !== 'drop') && (action !== 'decline')) ||
            ((action === 'drop') && (offerId.split('_')[0] !== myId)) ||
            ((action === 'decline' && (offerId.split('_')[1] !== myId)))
        ){ resolve({status: 403, message: "Bad query"}); return }
        User.findOne({steamid: myId})
        .then( myUser => {
            /*
            In order to be deleted the offer must
            exists for both users.
            */
            let { status } = checkOfferId(myUser, otherUser, myField, otherField, offerId);
            /*
            If the user does not exist it is possible that
            it was erased by otherUser through dropping
            or declining, in this case the offer is filtered
            in both users (if it is not present in their
            profiles nothing will happen).
            */
            myUser[myField] = myUser[myField].filter(offer => offer.offer_id !== offerId);
            otherUser[otherField] = otherUser[otherField].filter(offer => offer.offer_id !== offerId);
            if(status === 404){
                console.log(myUser);
                myUser.save().then(async newMyUser => {
                    console.log(newMyUser);
                    resolve(await tradePackage(req, isPersonal? newMyUser : otherUser, 404, isPersonal))
                });
                return;
            }
            /*
            Finally, if the offer does exist in both
            profiles both users are notified accordingly
            */
            myUser.general_timeline.push(
                [
                    today, 'T', myAction, otherUser.name
                ]
            );
            otherUser.general_timeline.push(
                [
                    today, 'T', otherAction, myUser.name
                ]
            );
            otherUser.save().then(newOtherUser => myUser.save().then(async newMyUser =>
                resolve(await tradePackage(req, isPersonal? newMyUser : newOtherUser, 200, isPersonal))
            ));
        })
        .catch((err) => {console.log(err);resolve({status: 500})})
    });
}