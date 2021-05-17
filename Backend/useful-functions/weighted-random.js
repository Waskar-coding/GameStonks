//Packages
const Math = require('math');

//Useful functions
const range = require('./range');

//Main function
module.exports = (spec) =>  {
    const table  = Object.entries(spec).reduce((currentTable, [multiplierKey, multiplierProb]) => {
        for(let i = 0; i < multiplierProb * 100; i++) currentTable.push(multiplierKey);
        return currentTable;
    }, []);
    return table[Math.floor(Math.random() * table.length)];
}
