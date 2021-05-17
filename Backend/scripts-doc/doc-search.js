//Exported functions
module.exports = {
    docSearchFiltering: (req, searchResults) => {return new Promise(resolve => {
        /*
        Filters document searchResults using the parameter search in req.query, only documents with the search
        parameter on their title (determine by language in req.query) pass the filter.
        */
        const search = new RegExp(req.query.search,'i');
        const {language} = req.query;
        resolve(searchResults.filter(doc => {
            return((search.test(doc['doc_title'][language]))||(search.test(doc['doc_article_resume'][language])))
        }))
    })},
    docSearchSuccess: (req, count, newSearchResults) => {
        /*
        Prepares the search results to be sent to the Frontend server
        */
        const language = req.query.language;
        const currentDocs = newSearchResults.map(doc => {
            const {_id, doc_title, doc_updated, doc_article_resume, doc_article_thumbnail} = doc;
            return {
                docId: _id, docTitle: doc_title[language], docDate: doc_updated,
                docResume: doc_article_resume[language], docThumbnail: doc_article_thumbnail
            }
        });
        return new Promise(resolve => resolve({current_n: count, items: currentDocs}))
    }
}