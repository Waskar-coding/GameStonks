//Local schemas
const User = require('../schemas/schema-user');

//Constants
const MY_MAX_OFFERS = 10;
const USER_MAX_OFFERS = 50;

//Check if an user can trade something
const checkEmpty = (user) => {
    return !(
        (user.wealth > 0) ||
        (user.multipliers.length > 0) ||
        (user.events.filter(event => {return (event.products.length > 0) && (event.status === 'a')}).length > 0)
    )
}

//Get user
const getUser = (userId) => {
    return new Promise(resolve => {
        User.findOne({steamid: userId})
        .then(user => resolve([200, user]))
        .catch(() => resolve([500, null]))
    })
}

//Unpack user trade data
const unpackTradeData = user => {
    return {
        userName: user.name,
        userThumbnail: user.thumbnail,
        wealth: user.wealth,
        multipliers: user.multipliers,
        handshakeEvents: user.multipliers.map(multiplier => multiplier.split('_')[0]).includes('handshake')?
            user.events.filter(event => {
                return (event.status === 'a') && (event.products.length > 0)
            }).map(event => event.event_id) : []
    }
}

//Main function
module.exports = async (req, res) => {
    const myId = req.user.user.steamid;
    const userId = req.query.userId;
    /*
    Getting both users
    */
    const [ myStatus, myUser ] = await getUser(myId);
    const [ otherStatus, otherUser ] = await getUser(userId);
    if((myStatus !== 200) || (otherStatus !== 200)){
        res.status(500).send({});
        return;
    }
    /*
    Creating trade package
    */
    const tP = {
        currentOffer: null,
        myTradeData: {
            userId: myId,
            ...unpackTradeData(myUser)
        },
        userTradeData: {
            userId: userId,
            ...unpackTradeData(otherUser)
        },
        err: null
    }
    /*
    If an offer already exists the
    trade package is sent with the
    current offer
    */
    const currentOffer = myUser.my_offers.filter(offer => {
        const splitOfferId = offer.offer_id.split('_');
        return splitOfferId[0] === myId && splitOfferId[1] === userId;
    }).pop();
    if(currentOffer){
        res.status(200).send({...tP, currentOffer: currentOffer})
        return
    }
    /*
    If no offer exists, trade
    availability is checked
    */
    if(checkEmpty(myUser) === true) res.status(200).send({...tP, err: "my-empty"})
    else if(checkEmpty(otherUser) === true) res.status(200).send({...tP, err: "user-empty"})
    else if(myUser.my_offers.length >= MY_MAX_OFFERS) res.status(200).send({...tP, err: "my-max-offers"});
    else if(otherUser.user_offers.length >= USER_MAX_OFFERS) res.status(200).send({...tP, err: "user-max-offers"});
    else res.status(200).send(tP)
}