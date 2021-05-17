const checkMoneyInput = require('./user-donation-check-money-input');
const userUpdate = require('./user-update');
const {doubleChecking} = require('./user-checking');
module.exports = async (req, myId, userId, transferredWealth, dateParams, isPersonal, res) => {
    /*
    Used to make a donation to another user. Firstly it checks the following things:
        * The transferred wealth is an allowed value
        * Prevents self-donations
        * The receiver has a valid account
        * User's wealth is superior to the donation
        * Handles server errors
    If none of these problems appear, userUpdate is called for the donor and receiver profiles, each with the
    corresponding event.
    */
    if(!checkMoneyInput(Number(transferredWealth))){res.status(403).send({Error: "Invalid donation input"})}
    else if(userId === myId){res.status(403).send({Error: "You are donating to yourself"})}
    else{
        const [myStatus, myProfile] = await doubleChecking(req, myId, (req,user) => {
            return user.wealth >= transferredWealth? [200,user] : [403,{Error: "Your wealth is insufficient"}];
        })
        const [userStatus, userProfile] = await doubleChecking(req, userId, (req,user) => {
            return user !== null? [200,user] : [404,{Error: "User not found"}];
        });
        if((myStatus === 200) && (userStatus === 200)){
            const myNewState = await userUpdate(
                myProfile, [new Date(),'G','D', Number(transferredWealth), userProfile.name],
                -transferredWealth, true, dateParams, isPersonal
            );
            const userNewState = await userUpdate(
                userProfile, [new Date(),'G','R', Number(transferredWealth), req.user.user.name],
                transferredWealth, false, dateParams, !isPersonal
            );
            res.status(200).send(isPersonal? myNewState : {...userNewState, myWealth: myNewState.wealth});
        }
        else{(myStatus !== 200)? res.status(myStatus).send(myProfile) : res.status(userStatus).send(userProfile)}
    }
}