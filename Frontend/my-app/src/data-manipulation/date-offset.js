function getLocalDate(dateUTC){
    return new Date(dateUTC.getTime() - dateUTC.getTimezoneOffset()*60*1000);
}
export default getLocalDate;