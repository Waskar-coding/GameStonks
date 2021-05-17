const friendCategories = ['P','M','B','G','U','T'];
module.exports = (points, startDate, finalDate, isPersonal) => {
    /*
    Filters all actions between startDate and finalDate for a user, if isPersonal is false only the friendCategories
    are allowed
    */
    return new Promise(resolve => {
        resolve(points.filter(action => {
            const actionDate = new Date(action[0]);
            if(!isPersonal){
                return (actionDate >= startDate) && (actionDate < finalDate) && (friendCategories.includes(action[1]))
            }
            else return((actionDate >= startDate) && (actionDate < finalDate))
        }))
    })
}