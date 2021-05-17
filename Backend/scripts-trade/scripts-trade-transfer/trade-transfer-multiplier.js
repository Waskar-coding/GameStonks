//Main function
module.exports = (myUser, otherUser, transferredMultiplierClass) => {
    /*
    Transfers a multiplier from myUser to otherUser
    */
    console.log(`${myUser.name} => ${otherUser.name}: ${transferredMultiplierClass}`)
    return new Promise(resolve => {
        let transferredMultiplier;
        myUser.multipliers.some(multiplier => {
            if(multiplier.split('_')[0] === transferredMultiplierClass){
                transferredMultiplier = multiplier;
                return true;
            }
            else return false;
        });
        myUser.multipliers = myUser.multipliers.filter(multiplier => multiplier !== transferredMultiplier);
        otherUser.multipliers.push(transferredMultiplier);
        resolve({status: 200, myUser: myUser, otherUser: otherUser})
    });
}