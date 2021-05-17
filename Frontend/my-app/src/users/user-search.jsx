//Standard
import React, {useContext} from "react";

//Packages
import {Link} from "react-router-dom";

//Local Components
import DefaultAPIGet from "../api-interaction/default-api-get";
import SearchItemList from "../search/search-item-list";
import SearchList from "../search/search-list";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier";

//Context
import LanguageContext from "../context/language-context";
import withDefaultLoadError from "../api-interaction/with-default-load-&-error";

//Main function
const WrappedProfileSearch = ({location}) => {
    const language = useContext(LanguageContext);
    return(
        <SearchList
            defaultSort="name"
            displayPerPage = "3"
            message="user-message"
            placeholder="user-placeholder"
            tooltip="user-tooltip"
            notFound="users-404"
            options={JSON.stringify({
                name: interactiveDict['search-form']['user-name'][language],
                joined: interactiveDict['search-form']['user-date'][language]
            })}
            location={location}
        >
            <UserSearch />
        </SearchList>
    )
}
export default React.memo(WrappedProfileSearch);

const UserSearch = React.memo(({sort, order, search, page}) =>
    withDefaultLoadError(
        DefaultAPIGet,
        ProfileList,
        `/users/find?sort=${sort}&order=${order}&search=${search}&page=${page}`,
        "user-search",
        {500: "user-search-500", 404: "user-search-404"}
    )
)

const ProfileList = ({state}) =>
    <SearchItemList
        state={state}
        notFound="user-search-404"
        idName="userId"
        ItemElement={Profile}
    />

const Profile = ({item, state}) =>
    <Link
        to={(item.userId === state.myId)? "/users/my_profile" : `/users/profiles/${item.userId}`}
    >
        <div><img src={item.thumbnail} alt={item.name} /></div>
        <div>{item.name}</div>
        <div>{item.joined.split('T')[0]}</div>
    </Link>