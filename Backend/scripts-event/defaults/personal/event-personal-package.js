//Local schemas
const User = require('../../../schemas/schema-user');

//Main function
module.exports = (req, res) => {
    User.findOne({steamid: req.user.user.steamid})
        .then(user => {
            const currentEvent = req.cookies.currentEvent;
            let currentRegister = user.events.filter(event => {
                return event.event_id === req.params.event_id;
            });
            currentRegister = (currentRegister.length > 0)? currentRegister.pop() : null;
            res.status(200).send({
                steamid: user.steamid,
                name: user.name,
                thumbnail: user.thumbnail,
                wealth: user.wealth,
                multipliers: user.multipliers,
                handshakeEvents: user.multipliers.map(multiplier => multiplier.split('_')[0]).includes('handshake') &&
                    currentRegister.products.length > 0 &&
                    currentEvent.max_multipliers <= currentRegister.multipliers? [currentEvent.event_id] : [],
                register: currentRegister,
                max_multipliers: currentEvent.max_multipliers,
                products: (currentRegister !== null) ?
                    user.monitored.filter(product => {
                        return (
                            (currentRegister.products.includes(product.product_id))
                            &&
                            (product.register_type === 'J01')
                        )
                    })
                    :
                    []
            });
        })
        .catch(() => {res.status(500).send({})})
}