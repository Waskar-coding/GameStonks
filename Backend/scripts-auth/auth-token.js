//Packages
const jwt = require('jsonwebtoken');

//Auth files
const config = require('./auth-config')

//Main function
module.exports = (steamid) => {
    /*
    Token expires in 24 hours
    */
    return jwt.sign({id: steamid}, config.secret, {expiresIn: 86400})
}