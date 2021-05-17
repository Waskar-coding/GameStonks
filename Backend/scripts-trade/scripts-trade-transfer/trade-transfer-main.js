//Main function
module.exports = (myUser, otherUser, tradeType, tradeValue) => {
    /*
    Transfers cash, multipliers, or gives a handshake from
    myUser to otherUser depending on tradeType and tradeValue
    */
    const transferFunction = require(`./trade-transfer-${tradeType}`);
    return transferFunction(myUser, otherUser, tradeValue);
}