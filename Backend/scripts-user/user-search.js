module.exports = {
    userSearchFiltering: (req,searchResults) => {return new Promise(resolve => resolve(searchResults))},
    userSearchSuccess: (req, count, newSearchResults) => {return new Promise(resolve => {
        /*
        Formats the filtered searchResults so they are easy process by the frontend
        */
        resolve({
            current_n: count, myId: req.user? req.user.user.steamid : "",
            items: newSearchResults.map(user => {
                return {userId: user.steamid, name: user.name, thumbnail: user.thumbnail, joined: user.joined}
            })
        })}
    )}
}