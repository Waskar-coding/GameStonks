module.exports = (req, user, isPersonal) => {
    return new Promise(resolve => {
        resolve(
            {
                userId: user.steamid,
                userName: user.name,
                userThumbnail: user.thumbnail,
                multipliers: user.multipliers,
                wealth: user.wealth,
                surveys: user.surveys,
                isPersonal: isPersonal,
                lastSurvey: user.lastSurvey
            }
        )
    })
}