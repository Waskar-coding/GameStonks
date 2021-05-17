//Packages
const axios = require('axios');
const Math = require('math');
const { parse } = require('node-html-parser');

//Main function
module.exports = user => {
    /*
    Checking if the account is private and old enough
    */
    const MIN_TIME = 100;
    const MIN_VALUE = 0;
    const timeCreated = user.timecreated;
    const currentTime = Math.round((new Date()).getTime() / 1000);
    const difference = currentTime - timeCreated;
    return new Promise((resolve,reject) => {
        if(timeCreated === undefined){resolve(true)}
        if(difference < MIN_TIME){resolve(true)}
        /*
        Using steamcalculator to check the value of the account
        */
        axios.get('https://steamcalculator.com/id/'+ user.steamid)
            .then(res => {
                const root = parse(res.data);
                const accountValue = Number(
                    root.querySelector('.account-value__amount').childNodes[0].rawText.split(' ')[0]
                );
                resolve(accountValue < MIN_VALUE)
            })
            .catch(() => {reject(true)})
    });
}