//Useful functions
const generateWealthPoints = require('../../useful-functions/generate-wealthpoints');
const filterActions = require('../../useful-functions/filter-actions');

//Main function
module.exports = async (req, user, status, isPersonal, offerId) => {
    const {
        startDateList, finalDateList,
        startDateGraph, finalDateGraph
    } = req.body;
    let currentOffer = isPersonal? null : user.user_offers.filter(offer => offer.offer_id === offerId).pop();
    return new Promise(async resolve => {
        resolve(
            {
                status: status,
                newMultipliers: user.multipliers,
                newWealth: user.wealth,
                newEvents: user.events.filter(event => event.status === 'a').map(event => event.event_id),
                newListTimeline: await filterActions(
                    user.general_timeline,
                    new Date(startDateList),
                    new Date(finalDateList),
                    isPersonal
                ),
                newGraphTimeline: isPersonal?
                    await filterActions(
                        user.general_timeline,
                        new Date(startDateGraph),
                        new Date(finalDateGraph),
                        isPersonal
                    ) : null
                ,
                newGraphPoints: isPersonal?
                    await generateWealthPoints(
                        new Date(user.joined),
                        new Date(startDateGraph),
                        new Date(finalDateGraph),
                        user.wealth_timetable
                    ) :
                    null,
                currentOffer: currentOffer !== undefined && !isPersonal? {
                    offer_id: offerId,
                    offer_user_id: user.steamid,
                    offer_user_name: user.name,
                    offer_date: currentOffer.offer_date,
                    offer_user_thumbnail: user.thumbnail,
                    offer_type_out: currentOffer.offer_type_in,
                    offer_value_out: currentOffer.offer_value_in,
                    offer_type_in: currentOffer.offer_type_out,
                    offer_value_in: currentOffer.offer_value_out
                } : null
            }
        )
    })
}