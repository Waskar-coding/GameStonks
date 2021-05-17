//Packages
const express = require('express');
const passport = require('passport');
const router = express.Router();

//Auth scripts
const deleteProfile = require('../scripts-auth/auth-delete');
const ensureAuthenticated = require('../scripts-auth/auth-ensure');
const verifyToken = require('../scripts-auth/auth-verify');

//Index page
const indexPage = process.env.INDEX_PAGE.toString();

//Login through steam
router.get(
    '/login',
    passport.authenticate('steam-login', { failureRedirect: '/wrong' }),
    (req, res) => {res.redirect('./account')}
);
router.get(
    '/login/return',
    (req, res, next) => {req.url = req.originalUrl; next()},
    passport.authenticate('steam-login', { failureRedirect: '/wrong' }),
    (req, res) => {res.redirect('../account')}
);

//Register through steam
router.get(
    '/register',
    passport.authenticate('steam-register', { failureRedirect: '/wrong' }),
    (req,res)=> {res.redirect('./account')}
);
router.get(
    '/register/return',
    passport.authenticate('steam-register', { failureRedirect: '/wrong' }),
    (req, res) => {res.redirect('../account')}
);

//Login and delete through steam
router.get(
    '/login-delete',
    (req, res, next) => {req.url = req.originalUrl; next()},
    passport.authenticate('steam-delete', { failureRedirect: '/wrong' }),
    (req, res) => {res.redirect('./account')}
);
router.get(
    '/login-delete/return',
    passport.authenticate('steam-delete', { failureRedirect: '/wrong' }),
    (req, res) => {res.redirect('../account')}
);

//Delete user
router.delete('/delete', ensureAuthenticated, verifyToken, async(req, res) => {
    await deleteProfile(req, res)
        .then(() => res.status(200).send({}))
        .catch(() => res.status(500).send({}))
});

//Account
router.get('/account', ensureAuthenticated, async(req, res) => {
    const {user, notifyType, notifyData} = req.user;
    if(notifyType !== ''){
        res.cookie('notify', true);
        res.cookie('notifyType', notifyType);
        res.cookie('notifyData', notifyData);
    }
    if(notifyType === 'delete'){
        await deleteProfile(req, res)
            .then(() => res.redirect(indexPage))
            .catch(err => res.redirect(indexPage))
    }
    else if(!user) { req.logout(); res.redirect(indexPage) }
    else res.redirect('http://localhost:3000/users/my_profile')
});

//Logout
router.get('/logout', (req, res) => { req.logout(); res.status(200).send({status: 'logout'})});

module.exports = router;