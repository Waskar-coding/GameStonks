//Useful functions
const eventPrivateSuccess = require('./event-features-private-success');
const eventPublicSuccess = require('./event-features-public-success');

//Main function
module.exports = async(req, count, newSearchResults) => {
    const isAuth = req.user !== undefined;
    const productItems = isAuth?
        await eventPrivateSuccess(req.user.user.steamid, req.params.event_id, newSearchResults)
        :
        await eventPublicSuccess(newSearchResults);
    return new Promise(resolve => {resolve({
        eventId: req.params.event_id, current_n: count, items: productItems, isAuth: isAuth
    })})
}