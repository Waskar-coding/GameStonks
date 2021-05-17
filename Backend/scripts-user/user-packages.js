//Useful functions
const addDefaultWealthPoints = require('../useful-functions/generate-wealthpoints');
const filterActions = require('../useful-functions/filter-actions');

//Defaults
const generateDefaultDates = (joined) => {
    /*
    Generates the default dates to pass as a parameter to the filterActions function in generateDefaultUserPackage
    the default start date depends on when the user joined, if it was less than a month ago joined is returned, if not
    it is exactly a month from the current time. The default final date is always exactly a day from the current time.
    */
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today.setDate(today.getDate() + 1));
    const monthAgo = new Date(today.setMonth(today.getMonth()-1))
    return [(monthAgo < joined)? joined : monthAgo, tomorrow];
}

module.exports = {
    generateDefaultUserPackage: async (req, user, isPersonal) => {
        /*
        Returns the default package that will be displayed in both user profiles and personal profile,
        takes a user MongoDB object and a isPersonal field (Boolean) to apply filterActions. Wealth points
        is only calculated if isPersonal is true, otherwise it is false.
        */
        const [start, final] = generateDefaultDates(new Date(user.joined));
        const timeline = await filterActions(user.general_timeline, start, final, isPersonal);
        const wealthPoints = isPersonal?
            await addDefaultWealthPoints(new Date(user.joined), start, final, user.wealth_timetable) : [];
        return new Promise(resolve => resolve({
            startDate: start, finalDate: final, steamId: user.steamid, name: user.name, joined: user.joined,
            thumbnail: user.thumbnail, profileUrl: user.profile_url, wealth: user.wealth,
            events:  user.events.filter(event => event.status === 'a').map(event => event.event_id),
            multipliers: user.multipliers, strikes: user.strikes, requests: isPersonal && user.requests,
            eventNumber: user.events.length, questionNumber: user.survey_number, timeline: timeline,
            wealthPoints: wealthPoints, handshakeEvents: req.user? req.user.user.handshakeEvents : [],
            myMultipliers: req.user? req.user.user.multipliers : [], isAuth: req.user !== undefined,
            rewards: isPersonal && user.survey_rewards, myOffers: user.my_offers, userOffers: user.user_offers
        }))
    },
    generateTimeLine: async (req, user, isPersonal) => {
        /*
        Returns timeline between the two dates (start and final) indicated in req.query, events are filtered by
        categories if isPersonal is false, wealthPoints is only returned if type in req.query is graph and isPersonal
        is true
        */
        const start = new Date(req.query.start);
        const final = new Date(req.query.final);
        const timeline = await filterActions(user.general_timeline, start, final, isPersonal);
        const wealthPoints = (isPersonal && req.query.type === 'graph')?
            await addDefaultWealthPoints(new Date(user.joined), start, final, user.wealth_timetable) : [];
        return new Promise(resolve => {resolve({
            startDate: start, finalDate: final, timeline: timeline, wealthPoints: wealthPoints
        })})
    }
};