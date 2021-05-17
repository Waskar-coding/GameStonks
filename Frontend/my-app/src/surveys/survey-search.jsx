//Standard
import React, {useContext} from "react";

//Packages
import {Link} from "react-router-dom";

//Local components
import DefaultAPIGet from "../api-interaction/default-api-get";
import DescriptionBox from "../display-components/description-box";
import SearchItemList from "../search/search-item-list";
import SearchList from "../search/search-list";
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";

//Languaje jsons
import interactiveDict from "../language-display/interactive-classifier.json";
import otherDict from "../language-display/other-classifier.json";

//Context
import BasicProfileContext from "../context/profile-basic-context";
import LanguageContext from "../context/language-context";

//Main function
const WrappedSurveySearch = ({location}) => {
    const language = useContext(LanguageContext);
    return (
        <SearchList
            defaultSort="survey_start"
            displayPerPage="2"
            message="survey-message"
            placeholder="survey-placeholder"
            tooltip="survey-tooltip"
            notFound="surveys-404"
            options={JSON.stringify({
                survey_start: interactiveDict['search-form']['survey-start'][language],
                survey_tier: interactiveDict['search-form']['survey-tier'][language],
                survey_users_number: interactiveDict['search-form']['survey-users'][language]
            })}
        >
            <SurveySearch />
        </SearchList>
    )
}
export default React.memo(WrappedSurveySearch);

const SurveySearch = React.memo(({sort, order, search, page}) => {
    const language = useContext(LanguageContext);
    return(
        withDefaultLoadError(
            DefaultAPIGet,
            SurveyList,
            `/surveys/find?sort=${sort}&order=${order}&page=${page}&search=${search}&language=${language}`,
            "survey-search",
            {500: "survey-search-500", 404: "survey-search-404"}
        )
    )
})

const SurveyList = ({state}) => {
    return <SearchItemList state={state} notFound="survey-search-404" idName="surveyId" ItemElement={Survey} />
}

const Survey = ({item}) => {
    const language = useContext(LanguageContext);
    const {isAuth} = useContext(BasicProfileContext);
    const {
        surveyTitle, surveyThumbnail, surveyTier,
        surveyCreator, surveyStart, surveyStatus, surveyParticipants
    } = item;
    return(
        <Link to={`/surveys/${item.surveyId}`}>
            <DescriptionBox
                title={surveyTitle}
                thumbnail={surveyThumbnail}
                alt="Survey thumbnail"
                table={[
                    [
                        [otherDict['survey-search']['table-tier'][language],surveyTier],
                        [otherDict['survey-search']['table-creator'][language],surveyCreator]
                    ],
                    [
                        [otherDict['survey-search']['table-start'][language],surveyStart.split('T')[0]],
                        [otherDict['survey-search']['table-participants'][language],surveyParticipants]
                    ]
                ]}
            />
            {isAuth? (
                <div>{surveyStatus}</div>
            ) : (
                <div>Nope</div>
            )}
        </Link>
    )
}