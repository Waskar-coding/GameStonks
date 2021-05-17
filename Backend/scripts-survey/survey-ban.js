//Local schemas
const User = require('../schemas/schema-user');

//Main function
module.exports = (steamId, banResponse) => {
    console.log(`Banning user: {
        steamId: ${steamId},
        banResponse: ${JSON.stringify(banResponse)}
    }`);
    const {banAction, banRegister} = banResponse;
    return new Promise(resolve => {
        User.findOneAndUpdate(
            {steamid: steamId},
            {
                $set: {banned: true, ban: banRegister},
                $push: {general_timeline: Array(banAction)}
            },
            {new: true}
        )
            .then(() => resolve(banResponse))
            .catch(() => resolve({status: 'server-error'}))
    })
};