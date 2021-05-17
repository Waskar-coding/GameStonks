//Local schemas
const User = require('../schemas/schema-user');

//Local modules
const surveyBan = require('./survey-ban');

//Main function
module.exports = (steamId, strikeResponse) => {
    console.log(`Striking user: {
        steamId: ${steamId},
        strikeResponse: ${JSON.stringify(strikeResponse)}
    }`);
    const {strikeAction, strikeRegister} = strikeResponse;
    return new Promise(resolve => {
        User.findOneAndUpdate(
            {steamid: steamId},
            {$push: {general_timeline: Array(strikeAction), strikes: strikeRegister}},
            {new: true}
        )
            .then(async user => {
                if(user.strikes.length >= 3){
                    let banStart = Date.now();
                    let banFinal = banStart + 5184000000;
                    banStart = new Date(banStart);
                    banFinal = new Date(banFinal);
                    const banResponse = await surveyBan(
                        steamId,
                        {
                            status: 'ban',
                            banAction: [new Date(), 'B', 'B02-A'],
                            banRegister: {ban_date: banStart, ban_type: 'B02', ban_end: banFinal, ban_data: []}
                        }
                    );
                    resolve(banResponse);
                }
                else resolve(strikeResponse)
            })
            .catch(() => resolve({status: 'server-error'}))
    });
}