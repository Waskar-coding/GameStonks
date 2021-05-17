//Standard
import React, {useContext, useMemo, useState} from "react";

//Local components
import BoundedTimeLine from "../search/bounded-timeline";
import DeleteUser from "./delete/user-delete";
import DefaultAPIGet from "../api-interaction/default-api-get";
import DefaultProfile from "./defaults/user-basic";
import DonationForm from "./donations/user-donation-formik";
import Offer from "./trade/offers/user-trade-offer-main";
import ProfileTimeLineGraph from "./defaults/user-timeline-graph";
import RequestForm from "./requests/user-request-form";
import RewardList from "./rewards/user-reward";
import UserTimelineList from "./defaults/user-timeline-list";

//Useful functions
import getDefaultProfile from "./defaults/user-basic-config";
import getLocalDate from "../data-manipulation/date-offset";
import processAction from "../language-display/process-action";
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";
import {withMyTransaction} from "./hocs/user-with-transaction";

//Context
import LanguageContext from "../context/language-context";

//Wrapped main function
const WrappedMyProfile = () => {
    /*
    Initial checking, ensures authentication and returns the users's basic profile with
    no privacy restrictions, if the user is not authenticated a 403 error message will pop up
    */
    return (
        withDefaultLoadError(
            DefaultAPIGet, UserMyProfile,"/users/my_profile","my-profile",
            {500:"my-profile-500", 403: "my-profile-403"}
        )
    )
}
export default WrappedMyProfile;

//Inner main function
const UserMyProfile = ({state}) => {
    const language = useContext(LanguageContext);
    const {profile, setProfile, setList, list, processedListTimeLine} = getDefaultProfile(state, "1st");
    const [graph, setGraph] = useState({
        startDate: state.startDate, finalDate: state.finalDate,
        timeline: state.timeline, wealthPoints: state.wealthPoints,
        apiStatus: 200
    });
    const graphData = useMemo(() => {
        const {timeline, wealthPoints} = graph;
        return {
            ...graph,
            timeline: timeline.map(action => {return processAction(language, '1st', action)}),
            points: wealthPoints.map(point => {return {x: getLocalDate(new Date(point[0])).getTime(), y: point[1]}})
        }
    },[graph, language]);
    const myTransactionData = [
        state, profile, list,
        graph, setProfile,
        setList, setGraph
    ];
    return(
        <div>
            <DefaultProfile
                profileState={profile}
                profileSetter={setProfile}
                person="1st"
                initialState={state}
            />
            <BoundedTimeLine
                contextSetter={setGraph}
                state={state}
                apiPath="/users/my_timeline"
                displayType="graph"
            />
            <ProfileTimeLineGraph
                graphData={graphData}
            />
            {withMyTransaction(DonationForm, ...myTransactionData)}
            {withMyTransaction(RequestForm, ...myTransactionData)}
            {withMyTransaction(RewardList, ...myTransactionData)}
            {withMyTransaction(Offer, ...myTransactionData)}
            <BoundedTimeLine
                contextSetter={setList}
                state={state}
                apiPath="/users/my_timeline"
                displayType="list"
            />
            <UserTimelineList
                listStatus={list.apiStatus}
                processedListTimeLine={processedListTimeLine}
            />
            <DeleteUser />
        </div>
    )
};