//Local schemas
const User = require('../../../schemas/schema-user');

//Main function
module.exports = (req, res, user, generalAction, banRegister) => {
    User.findOneAndUpdate(
        {steamid: user.steamid},
        {
            $set: {banned: true, strikes: [], ban: banRegister, "events.$[].status": "k"},
            $push: {general_timeline: [generalAction]}
        },
        {new: true}
    )
        .then( () => {
            req.logout();
            res.cookie('notify', true);
            res.cookie('notifyType', banRegister.ban_type);
            res.cookie('notifyData', {action: generalAction, register: banRegister});
            res.cookie('banType', banRegister.ban_type);
            res.cookie('banEnd', banRegister.ban_end);
            res.cookie('banAction', generalAction);
            res.status(200).send({status: 'banned', banType: banRegister.ban_type});
        })
        .catch(() => {res.status(500).send({error: `Error while banning user ${user.steamid}`})})
}