//Local schemas
const User = require('../schemas/schema-user');

//Local modules
const tradePackage = require('./scripts-trade-packages/trade-package');

//Main function
module.exports = (req, res) => {
    console.log('fast delete');
    const myId = req.user.user.steamid;
    const { offerId, action, isPersonal } = req.body;
    User.findOneAndUpdate(
        {steamid: myId},
        {
            $pull: {
                [action === 'drop'? 'my_offers' : 'user_offers'] : {
                    offer_id: offerId
                }
            }
        },
        {new: true}
    )
    .then(async myUser => {
        res.status(200).send(await tradePackage(req, myUser, 200, isPersonal))
    })
    .catch(() => res.status(500).send({message: "Internal server error"}))
}