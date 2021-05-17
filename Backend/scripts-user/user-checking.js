//Local schemas
const User = require("../schemas/schema-user");

module.exports = {
    generalChecking: (req, res, userId, specificCheckingFunction, successFunction) => {
        /*
        Finds the user specified in the url params, checks for internal DB errors, executes its specificCheckingFunction
        when there are no errors.
        */
        User.findOne({steamid: userId})
            .then(user => specificCheckingFunction(req, res, user, successFunction))
            .catch(() => res.status(500).send({}))
    },
    myChecking: async (req, res, user, successFunction) => {
        /*
        Used only in express router functions with authentication middleware, waits for successFunction to execute and
        returns the result
        */
        res.status(200).send(await successFunction(req, user, true))
    },
    userChecking: async (req, res, user, successFunction) => {
        /*
        Used for express router function without authentication middleware, makes sure the provided user exists and
        waits for successFunction to return the result. If the user does not exist a 404 error is raised.
        */
        if(user === null) res.status(404).send({});
        else res.status(200).send(await successFunction(req, user, false));
    },
    doubleChecking: (req, userId, specificCheckingFunction) => {
        return new Promise(resolve => {
            User.findOne({steamid: userId})
                .then(user => resolve(specificCheckingFunction(req, user)))
                .catch(() => resolve([500,{}]))
        })
    }
}