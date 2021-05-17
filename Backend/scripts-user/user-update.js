//Userful
const filterEvents = require('../useful-functions/filter-actions');
const addDefaultWealthPoints = require('../useful-functions/generate-wealthpoints');

module.exports = async (profile, event, transferredWealth, isPersonal, dateParams, needsUpdate) => {
    /*
    Updates user profile with a new event, updates the general timeline and modifies the wealth if necessary, adds the
    new wealth to the wealth timetable. It also sends back the new wealth and the updated timeline and wealth timetable
    in compliance with the date params if specified through needUpdate.
    */
    profile.wealth = profile.wealth + Number(transferredWealth);
    profile.general_timeline.push(event);
    profile.wealth_timetable.push([new Date(), Number(profile.wealth)]);
    return new Promise(resolve => {profile.save().then(async(newProfile) => {
        if(needsUpdate){
            let {listStart, listFinal} = dateParams;
            listStart = new Date(listStart);
            listFinal = new Date(listFinal);
            const newWealth = newProfile.wealth;
            const listNewActions = await filterEvents(newProfile.general_timeline, listStart, listFinal, isPersonal);
            if(isPersonal) {
                let {graphStart, graphFinal} = dateParams;
                graphStart = new Date(graphStart);
                graphFinal = new Date(graphFinal);
                const graphNewActions = await filterEvents(
                    newProfile.general_timeline, graphStart, graphFinal, isPersonal
                );
                const graphNewPoints = await addDefaultWealthPoints(
                    new Date(newProfile.joined), graphStart, graphFinal, newProfile.wealth_timetable
                );
                resolve({
                    wealth: newWealth, listNewActions: listNewActions,
                    graphNewActions: graphNewActions, graphNewPoints: graphNewPoints
                })
            }else{resolve({wealth: newWealth, listNewActions: listNewActions})}
        }
        else{resolve({wealth: newProfile.wealth})}
    })})
}