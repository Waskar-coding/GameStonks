//Local schemas
const User = require('../schemas/schema-user');

//Main function
module.exports = (profile, banned) => {
    /*
    Creating profile account
    */
    return new Promise( resolve => {
        const today = new Date(Date.now());
        const newUser = new User ({
            steamid : profile.steamid, name : profile.personaname, joined : today,
            wealth_timetable: [[new Date(), 0]], general_timeline: [[new Date(),"D","E"]],
            timecreated: profile.timecreated, thumbnail: profile.avatarfull,
            profile_url: profile.profileurl, banned: banned, wealth: 0,
            surveys: [], survey_number: 0, survey_date: new Date("1996-04-04T12:00:00.000Z")
        });
        if(banned){
            newUser.ban = ({ban_start: today, ban_type: "B01"})
            newUser.general_timeline.push([new Date(), "B", "B01"])
        }
        else{newUser.ban = {}}
        newUser.save().then(storedUser => {resolve(storedUser)});
    });
}