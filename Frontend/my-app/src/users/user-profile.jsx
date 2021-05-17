//Standard
import React, {useState} from "react";

//Local components
import BoundedTimeLine from "../search/bounded-timeline";
import DefaultAPIGet from "../api-interaction/default-api-get";
import DefaultProfile from "./defaults/user-basic";
import DonationForm from "./donations/user-donation-formik";
import HandshakeForm from "./handshakes/user-handshake-form";
import OfferCreator from "./trade/creator/user-trade-creator-main";
import UserTimelineList from "./defaults/user-timeline-list";

//Useful functions
import getDefaultProfile from "./defaults/user-basic-config";
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";
import {withUserTransaction} from "./hocs/user-with-transaction";

//Wrapped main function
const WrappedUserProfile = ({location}) => {
    /*
    Initial checking, ensures the queried user has an account, if so the user's basic profile is sent
    with privacy restrictions (see friendCategories in user-get-packages at the Backend folder). If the
    user does not exists a 404 error message will pop up.
    */
    return (
        withDefaultLoadError(
            DefaultAPIGet, UserProfile,
            `/users/profiles/${location.pathname.split('/')[3]}/profile`,
            "user-profile", {500: "user-profile-500", 404: "user-profile-404"}
        )
    )
}
export default WrappedUserProfile;

//Inner main function
const UserProfile = ({state}) => {
    const {profile, setProfile, list, setList, processedListTimeLine} = getDefaultProfile(state, "3rd");
    const [handshake, setHandshake] = useState({
        isAuth: state.isAuth, multipliers: state.myMultipliers, events: state.handshakeEvents
    });
    const userTransactionData = [
        state, profile, list,
        setProfile, setList,
        handshake, setHandshake
    ];
    return(
        <div>
            <DefaultProfile
                profileState={profile}
                profileSetter={setProfile}
                person="3rd"
                initialState={state}
            />
            {withUserTransaction(DonationForm, ...userTransactionData)}
            {withUserTransaction(HandshakeForm, ...userTransactionData)}
            {withUserTransaction(OfferCreator, ...userTransactionData)}
            <BoundedTimeLine
                contextSetter={setList} state={state} displayType="list"
                apiPath={`/users/profiles/${state.steamId}/timeline`}
            />
            <UserTimelineList
                listStatus={list.apiStatus}
                processedListTimeLine={processedListTimeLine}
            />
        </div>
    )
}