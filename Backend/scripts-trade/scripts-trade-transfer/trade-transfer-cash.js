//Main function
module.exports = (myUser, otherUser, transferredCash) => {
    /*
    Transfers cash from myUser to OtherUser
    */
    console.log(`${myUser.name} => ${otherUser.name}: ${transferredCash}$`);
    return new Promise(resolve => {
        myUser.wealth = Number(myUser.wealth) - Number(transferredCash);
        myUser.wealth_timetable.push([new Date(), myUser.wealth]);
        otherUser.wealth = Number(otherUser.wealth) + Number(transferredCash);
        otherUser.wealth_timetable.push([new Date(), otherUser.wealth]);
        resolve({status: 200, myUser: myUser, otherUser: otherUser});
    });
}