//Local schemas
const Event = require('../../../schemas/schema-event.js');
const Product = require('../../../schemas/schema-product.js');
const User = require('../../../schemas/schema-user.js');

//Main function
module.exports = async(req, res, userId, eventId, appId, specificFiltering) => {
    const [user, userServerError, isKicked, isRegistered, isMonitored] = await checkUser(userId, eventId, appId);
    const [product, productServerError, isInDB, isInEvent] = await checkProduct(appId, eventId);
    const forbidden = [userServerError, productServerError, isKicked, isMonitored, !isInDB, !isInEvent].includes(true);
    if (forbidden) {
        res.status(400).send({
            error: "Could not past the first post filter",
            server: {
                user_query: userServerError,
                product_query: productServerError
            },
            user: {
                kicked: isKicked,
                product_already_monitored: isMonitored,
            },
            product: {
                product_not_in_db: !isInDB,
                product_not_in_event: !isInEvent
            }
        })
    } else {
        if (isRegistered) {
            specificFiltering(req, res, user, product, eventId, appId);
        } else {
            user.events.push({
                event_id: eventId, date: new Date(), status: 'i', score: 0,
                share_timetable: [], handshakes: [], multipliers: [], products: []
            });
            Event.findOneAndUpdate({event_id: eventId}, {$push: {users: userId}})
                .then(
                    user.save()
                        .then(newUser => specificFiltering(req, res, newUser, product, eventId, appId))
                        .catch(() => res.status(500).send({}))
                )
                .catch(() => res.status(500).send({}))
        }
    }
}

//Check product
const checkProduct = (appId, eventId) => {
    return new Promise((resolve,reject) => {
        Product.findOne({product_id: appId})
            .then(product => {
                if(product === null){resolve([null, false, false, false])}
                else{resolve([product, false, true, product.current_events.includes(eventId)])}
            })
            .catch(() => {reject([null, true, "", ""])})
    })
}

//Check user
const checkUser = async(userId, eventId, appId) => {
    const user = await new Promise((resolve, reject) => {
        User.findOne({steamid : userId}).then(user => resolve(user)).catch(() => reject(null))
    });
    if(user === null){
        return new Promise(resolve => resolve(["", true, "", "", ""]))
    }
    else if(user.banned === true){
        return new Promise(resolve => resolve([null, false, true, false, false]))
    }
    else{
        let isKicked = false;
        let isMonitored = false;
        let isRegistered = user.events.some(register => {
            if(register.event_id === eventId) {
                isKicked = register.status === 'k';
                isMonitored = register.products.includes(appId)
                return true
            }
        });
        return new Promise(resolve => resolve([user, false, isKicked, isRegistered, isMonitored]));
    }
}