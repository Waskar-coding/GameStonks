const configMoneyDisplay = (moneyValue) =>  {
    let [moneyDollars, moneyCents] = moneyValue.toString().split('.');
    if(moneyCents === undefined) return `${moneyDollars}.00`
    while(moneyCents.length < 2){moneyCents = moneyCents + '0'}
    return `${moneyDollars}.${moneyCents.slice(0,2)}`
}
export default configMoneyDisplay;