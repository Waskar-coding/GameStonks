function getLocalDate(dateUTC){
    const offset = dateUTC.getTimezoneOffset()*60*1000;
    return new Date(dateUTC.getTime() - offset);
}

export default getLocalDate;