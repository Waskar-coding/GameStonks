module.exports = (req, res, schemaObject, schemaSearch, display, filterFunction, successFunction) => {
    /*
    Performs a search in a mongo collection given by schemaObject and schemaSearch, the results are ordered and filtered
    using the parameters sort, order, search and page given in req.query. Once the search in the mongo collection has
    finished additional filtering is applied through filterFunction and then successFunction is applied to represent
    the results in the response package. Only a slice of the results determined by the offset is passed to
    successFunction, offset is determined by the display and the req.query.page parameters
    */
    const {sort, order, page} = req.query;
    const offset = display * (page - 1);
    schemaObject.find(schemaSearch).collation({locale: "en"}).sort({[sort]: order})
        .then(async(searchResults) => {
            const newSearchResults = await filterFunction(req, searchResults);
            const count = newSearchResults.length;
            res.status(200).send(await successFunction(req, count, newSearchResults.slice(offset, offset + display)))
        })
        .catch(() => res.status(500).send({}))
}