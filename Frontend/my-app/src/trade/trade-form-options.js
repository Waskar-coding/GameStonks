//Main function
const getOptions = (tradeData) => {
    const tradeOptions = [];
    tradeData.wealth > 0 && tradeOptions.push('cash');
    tradeData.multipliers.length > 0 && tradeOptions.push('multiplier');
    tradeData.handshakeEvents.length > 0 && tradeOptions.push('handshake');
    return tradeOptions;
}
export default  getOptions;
