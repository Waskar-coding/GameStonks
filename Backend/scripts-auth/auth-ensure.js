//Main function
module.exports = (req, res, next) => {
    if (req.isAuthenticated()) { return next(); }
    res.status(403).send({ auth: false, message: 'Not authenticated through steam' });
}