//Main functions
module.exports = {
    surveySearchFiltering: (req, searchResults) => {return new Promise(resolve => {
        /*
        Filters survey searchResults using the parameter search in req.query, only surveys with the
        search parameter on their title (determined by language in req.query) or creator pass the filter.
        */
        const search = new RegExp(req.query.search,'i');
        resolve(searchResults.filter(event => {
            return((search.test(event['survey_title'][req.query.language])||(search.test(event['survey_creator']))))
        }))
    })},
    surveySearchSuccess: async (req, count, newSearchResults) => {
        /*
        Formats the filtered searchResults so they are easy process by the frontend
        */
        /*
        Formats the filtered searchResults so they are easy process by the frontend, it compares them with the user
        registers obtained using getUserRegister (in case user has authenticated) in order to determine user's status
        within every event.
        */
        const currentSurveys = newSearchResults.map(survey => {return ({
            surveyId: survey.survey_id, surveyTitle: survey.survey_title[req.query.language],
            surveyThumbnail: survey.survey_thumbnail, surveyTier: survey.survey_tier,
            surveyCreator: survey.survey_creator, surveyStart: survey.survey_start,
            surveyParticipants: survey.survey_users_number, surveyStatus: 'i'
        })});
        const userSurveys = req.user !== undefined? req.user.user.surveys : [];
        return new Promise(resolve => {resolve({
            current_n: count, isAuth: req.user !== undefined,
            items: userSurveys.length === 0?
                currentSurveys : currentSurveys.map(survey => {
                    if(userSurveys.indexOf(survey.surveyId.toString()) !== -1) survey.surveyStatus = 'a';
                    return survey
                })
            })
        })
    }
}