//Packages
const axios = require('axios');
const Math = require('math');

//Local schemas
const Event = require('../../schemas/schema-event');

//Useful functions
const banUser = require('../defaults/post/event-post-ban');
const generalFilter = require('../defaults/post/event-post-general-filter');
const postSuccess = require('../defaults/post/event-post-success');
const strikeUser = require('../defaults/post/event-post-strike');

//Steam API key
const APIKEY = process.env.STEAM_PERSONAL_APIKEY;

//Main function
module.exports = (req,res) => {
    generalFilter(req, res, req.user.user.steamid, req.params.event_id, req.body.productId, J01Filter)
}

//J01 specific filter
const J01Filter = async(req, res, user, product, eventId, appId) => {
    axios.get(buildUrl(user.steamid))
        .then(async steamResponse => {
            if(steamResponse.data.response.games){
                const [isOwner, playtime] = await checkOwnership(appId, steamResponse.data.response);
                isOwner?
                    await J01RewardUser(req, res, user, product, eventId, playtime)
                    :
                    strikeUser(
                        req, res, user, product,
                        [new Date(), 'S', 'S01', eventId, product.name, product.product_id],
                        [new Date(), 'SJ', 'S01', product.name, product.product_id],
                        {
                            strike_type: 'S01',
                            strike_date: new Date(),
                            strike_data: [eventId,product.name,product.product_id]
                        },
                        eventId
                    );
            }
            else{
                const now = Date.now();
                const banStart = new Date(now);
                const banFinal = new Date(now + 2592000000);
                const banRegister = {ban_date: banStart, ban_type: 'B02', ban_end: banFinal, ban_data: []};
                banUser(req, res, user, [banStart, 'B', 'B02-B', eventId], banRegister)

            }
        })
        .catch(() => {res.status(500).send({error: "Failed steam api request"})})
}

//Building steam API url
const buildUrl = (userId) => {
    const STEAMAPI_BASE =  "http://api.steampowered.com";
    const STEAMAPI_ENV = "/IPlayerService";
    const STEAMAPI_FUNC = "/GetOwnedGames";
    const STEAMAPI_VERSION = "/v0001";
    const steamParams = {key: APIKEY, steamid: userId, format: "json", include_played_free_games: "true"};
    const paramUrl = `${STEAMAPI_BASE}${STEAMAPI_ENV}${STEAMAPI_FUNC}${STEAMAPI_VERSION}`;
    const queryUrl = `?key=${steamParams.key}&steamid=${steamParams.steamid}&format=${steamParams.format}`;
    const queryFreeGames = `&include_played_free_games=${steamParams.include_played_free_games}`;
    return(paramUrl + queryUrl + queryFreeGames)
}

//Checking game ownership
const checkOwnership = (appId, steamData) => {
    return new Promise(resolve => {
        let playtime = 0;
        const isOwner = steamData.games.some(product => {
            if(product.appid.toString() === appId){
                playtime = product.playtime_forever;
                return true
            }
        });
        resolve([isOwner, playtime])
    })
}

//Reward user
const J01RewardUser = async(req, res, user, product, eventId, playtime) => {
    const J01_TIME_SCALE = 120;
    const J01_PLAYER_SCALE = 4;
    const J01_PRODUCT_SCALE = 4;
    const productEventRegister = product.registers.find(register => {return register.event_id === eventId});
    const userEventRegister = user.events.find(event => {return event.event_id === eventId});
    const baseValue = productEventRegister.event_base_value;
    const monitoredUsers = productEventRegister.event_users.length;
    const loyaltyFactor = (1 + user.loyalty);
    const timeFactor = Math.exp(-playtime/J01_TIME_SCALE);
    const externalUserFactor = Math.pow(monitoredUsers+1,1/J01_PLAYER_SCALE);
    const internalUserFactor = Math.pow(userEventRegister.products.length + 1,1/J01_PRODUCT_SCALE);
    const scoreIncrement = baseValue * loyaltyFactor * timeFactor * externalUserFactor * internalUserFactor;
    const currentEvent = await new Promise((resolve, reject) => {
        Event.findOneAndUpdate({event_id: eventId},{$inc: {total_score: scoreIncrement}})
            .then(event => {resolve(event)})
            .catch(() => reject(res.status(500).send({})))
    });
    await postSuccess(
        req, res, user, product, eventId, eventId.split('_')[0], scoreIncrement,
        [new Date(), 'D', 'J01', product.name, product.product_id, eventId],
        [new Date(), 'DJ', 'J01', product.name, product.product_id],
        [{name: product.name, thumbnail: product.thumbnail, playtime: playtime}, []]
    )
}