//Local schemas
const Event = require('../../schemas/schema-event');

//Main function
module.exports = (user, exchange_type, exchange_value) => {
    /*
    Ensures the user meets the trade conditions by
    performing a check in accordance to the exchange type
    */
    return new Promise(resolve => {
        switch (exchange_type) {
            case 'cash':
                resolve(Number(user.wealth) >= exchange_value);
                break;
            case 'multiplier':
                resolve(user.multipliers.some(multiplier => multiplier.split('_')[0] === exchange_value));
                break;
            case 'handshake':
                /*
                Starts checking out if the user owns the
                multipliers
                */
                if (user.multipliers.some(multiplier => multiplier.split('_')[0] === 'handshake') === false) {
                    console.log('No multiplier');
                    resolve(false);
                    return;
                }
                /*
                If the user is participating in the event,
                an event register must exist in the user's
                profile
                */
                const userEvent = user.events.filter(event => event.event_id === exchange_value).pop();
                if (!userEvent) {
                    console.log('Does not exist');
                    resolve(false);
                    return;
                }
                /*
                The user cannot handshake if kicked from an
                event or has no products registered
                */
                if ((userEvent.status !== 'a') || (userEvent.products.length <= 0)){
                    console.log('No products');
                    resolve(false);
                    return;
                }
                /*
                The event must be checked to know whether
                the user has exceeded the maximum number
                of multipliers or if it is already closed
                */
                Event.findOneAndUpdate({event_id: exchange_value})
                .then(event => {
                    if(
                        (event.multipliers >= userEvent.multipliers.length) &&
                        (new Date(event.final) >= new Date()) &&
                        (event.users.includes(user.steamid))
                    ) resolve( true)
                    else resolve(false)
                })
                .catch(() => resolve(false));
                break;
            default:
                resolve(false);
                break;
        }
    })
}