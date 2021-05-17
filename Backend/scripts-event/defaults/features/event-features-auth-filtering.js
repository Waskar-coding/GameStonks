//Local schemas
const Product = require('../../../schemas/schema-product.js');
const User = require('../../../schemas/schema-user');

//Useful functions
const defaultSearch = require('../../../useful-functions/search');

//Main function
module.exports = (req, res, filteringFunction, successFunction) => {
    if(req.user){
        User.findOne({steamid: req.user.user.steamid})
            .then(user => {
                const eventIndex = user.events.map(register => register.event_id).indexOf(req.params.event_id);
                if (eventIndex !== -1) {
                    if(user.events[eventIndex].status === 'k'){res.status(403).send({})}
                    else{
                        defaultSearch(
                            req, res, Product, {current_events: {$in: [req.params.event_id]}},
                            8, filteringFunction, successFunction
                        );
                    }
                }
                else{
                    defaultSearch(
                        req, res, Product, {current_events: {$in: [req.params.event_id]}},
                        8, filteringFunction, successFunction
                    );
                }
            })
            .catch(() => {res.status(500).send({})})
    }else{
        defaultSearch(
            req, res, Product, {current_events: {$in: [req.params.event_id]}},
            8, filteringFunction, successFunction
        );
    }
}