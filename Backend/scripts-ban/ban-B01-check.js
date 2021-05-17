//Packages
const axios = require('axios');
const Math = require('math');
const { parse } = require('node-html-parser');

//Main function
module.exports = user => {
    /*
    Checking if the account is private and old enough
    */
    const MIN_TIME = 1000;
    const MIN_VALUE = 20;
    const timeCreated = user.timecreated;
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const difference = currentTime - timeCreated;
    return new Promise((resolve,reject) => {
        if(timeCreated === undefined){resolve(true)}
        if(difference < MIN_TIME){resolve(true)}
        /*
        Using steamcalculator to check the value of the account
        */
        axios.get('https://www.playerauctions.com/value-calculator/api/get_games.php?id='+ user.steamid)
            .then(res => {
                if(res.data === 'error'){resolve(true)}
                else{
                    const accountValue = res.data.reduce((prevVal, currentVal) => {
                        if(currentVal.price !== '666'){return prevVal + Number(currentVal.price)}
                        else{return prevVal}
                    },0);
                    resolve(accountValue < MIN_VALUE)
                }
            })
            .catch(err => {console.log(err);reject(true)})
    });
}