//Check if input is acceptable
module.exports = (inputValue) => {
    /*
    Makes sure that the donation input is a number that will not mess the display up
    */
    if(!isNaN(inputValue) && (inputValue > 0)){
        const stringInputValue = inputValue.toString();
        if(stringInputValue.includes('e') || (inputValue <= 0)){return false}
        else if(stringInputValue.includes('.',0)){return stringInputValue.split('.')[1].length <= 2}
        else if(stringInputValue.includes(',',0)){return stringInputValue.split(',')[1].length <= 2}
        else{return true}
    }else{return false}
}
