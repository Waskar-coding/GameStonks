const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('../object_db/user_db.js');

function verifyToken(req, res, next) {
    const token = req.user.token;
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, config.secret, function(err, decoded) {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

        // if everything's good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
}

function verifyJackpot(req, res, next) {
    User.findOne({steamid: req.user.user.steamid},function(err,user){
        if(!err){
            if(user.jackpots.length !== 0){
                for (let jackpot of user.jackpots){
                    if ((jackpot.jackpot_id === req.params.jackpot_id) && (jackpot.status === 'k')){
                        return res.status(403).send({auth: false, message: 'You were kicked from this jackpot'});
                    }
                    else if (jackpot.jackpot_id === req.params.jackpot_id){
                        next();
                    }
                }
            }
            else{
                next();
            }
        }
        else{
            console.log(err)
        }
    });
}

module.exports = {
    verifyToken,
    verifyJackpot
};
