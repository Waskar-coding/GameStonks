module.exports = (req, searchResults) => {
    return new Promise(resolve => {
        const search = new RegExp(req.query.search,'i');
        resolve(searchResults.filter(product => {return(search.test(product['name']))}))
    })
}