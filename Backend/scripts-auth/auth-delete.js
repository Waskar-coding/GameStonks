//Local schemas
const User = require('../schemas/schema-user');

//Index page
const indexPage = process.env.INDEX_PAGE.toString();

//Main function
module.exports = (req, res) => {
    return new Promise((resolve, reject) => {
        User.deleteOne({steamid: req.user.user.steamid})
            .then(() => {
                res.cookie('notify', true);
                res.cookie('notifyType', 'delete');
                res.cookie('notifyData', {});
                req.logout();
                resolve({})
            })
            .catch(() => {
                res.cookie('notify', true);
                res.cookie('notifyType', 'delete-error');
                res.cookie('notifyData', {});
                reject({});
            })
    })
}