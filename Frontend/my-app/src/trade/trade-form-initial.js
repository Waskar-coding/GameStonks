//Main function
const getInitial = (tradeType, tradeData) => {
    /*
    SETS THE INITIAL VALUES FOR A TRADE
    FORM ACCORDING TO TRADETYPE AND TRADEDATA
    */
    switch(tradeType){
        case 'cash': return 0;
        case 'multiplier': return tradeData.multipliers[0].split('_')[0];
        default: return tradeData.handshakeEvents[0];
    }
}
export default getInitial;