//Useful functions
const mergeSort = require('./merge-sort');
const filterActions = require('./filter-actions');
const range = require('./range');

//Main function
module.exports = async (joined, startDate, rawFinalDate, wealthTimeTable) => {
    /*
    Generates 10 default points in regular intervals between startDate and finalDate and adds them to the filtered
    wealth timetable. If start date is inferior to the date the user joined or final date is inferior to start date
    an empty array is returned. When this first condition is not met a pastWealth variable is generated using the
    wealth of the nearest points registered in a date below startDate and a range of 10 dates (milliseconds since epoch)
    between startDate and finalDate is created. A list of 10 points will be created using the 10 dates and the filtered
    time table. If the filtered time table has no events pastWealth will repeat itself in the 10 points, however, if
    it includes other wealth points from events the wealthIndex (initialized at -1) will be used to check if the date is
    posterior to the current event selected through it, if so pastWealth will update to the wealth of the current event
    and wealthIndex will advance a position. If we already have passed all the events then the function will act as in
    the first case repeating pastWealth until the 10 points are created.
    */
    const finalDate = rawFinalDate <= new Date()? rawFinalDate : new Date();
    const filteredWealthTimeTable = await filterActions(wealthTimeTable, startDate, finalDate, true);
    const filteredLength = filteredWealthTimeTable.length;
    let wealthIndex = 0;
    if((startDate < joined) || (startDate >= finalDate)){return new Promise(resolve => {resolve([])})}
    else{
        const pastTimeline = await filterActions(wealthTimeTable, joined, startDate, true);
        let pastWealth = (wealthTimeTable.length < 2)? wealthTimeTable[0][1] : pastTimeline[pastTimeline.length-1][1];
        const epochStart = startDate.getTime();
        const epochFinal = finalDate.getTime();
        const step = (epochFinal - epochStart)/10;
        const defaultWealthDates = range(epochStart-step, epochFinal+step, step);
        const defaultWealthPoints = (filteredLength === 0)?
            defaultWealthDates.map(epochDate => [new Date(epochDate), pastWealth])
            :
            defaultWealthDates.map(epochDate => {
                while(new Date(epochDate) >= new Date(filteredWealthTimeTable[wealthIndex][0])){
                    pastWealth = filteredWealthTimeTable[wealthIndex][1];
                    if(wealthIndex === filteredLength-1){break}
                    else{wealthIndex++}
                }return [new Date(epochDate), pastWealth]
            });
        return new Promise(resolve => {
            resolve(mergeSort([...filteredWealthTimeTable, ...defaultWealthPoints]))
        })

    }
}