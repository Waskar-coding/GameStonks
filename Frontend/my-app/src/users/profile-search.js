import React from "react";
import PageList from "../pagination/PageList";
import SearchForm from "../search/SearchForm";
import queryString from "query-string";
import findMaxPage from "../pagination/MaxPage";
import axios from "axios";


const UserListOptions = {
    name: 'User name',
    joined: 'Joining date'
};


class Profiles extends React.Component{
    constructor(props){
        super(props);
        if(props.location.search!=="") {
            const query = queryString.parse(props.location.search);
            if(
                (query.page !== undefined)
                && (query.sort !== undefined)
                && (query.order !== undefined)
                && (query.search !== undefined)
            ) {
                this.state = {
                    error: null,
                    sort: query.sort,
                    order: query.order,
                    search: query.search,
                    page: query.page,
                    current_number: 1,
                };
            }
            else {
                this.state = {
                    error: null,
                    sort: 'start',
                    order: '1',
                    search: "",
                    page: 1,
                    current_number: 1,
                };
            }
        }
        else{
            this.state={
                error: null,
                sort: 'start',
                order: '1',
                search: "",
                page: 1,
                current_number: 1,
            };
        }
        this.callbackPage = this.callbackPage.bind(this);
        this.callbackSearch = this.callbackSearch.bind(this);
        this.callbackLoad = this.callbackLoad.bind(this);
    }
    callbackPage(page){
        window.location = (`./find?sort=${this.state.sort}&order=${this.state.order}&page=${page}&search=${this.state.search}`)
    }
    callbackSearch(sort, order, search){
        window.location = (`./find?sort=${sort}&order=${order}&page=1&search=${search}`)
    }
    callbackLoad(current_n){
        this.setState({
            current_number: current_n
        });
    }
    render(){
        const currentUsers = (this.state.current_number!==undefined)? this.state.current_number : 0;
        return(
            <div>
                <SearchForm
                    message={`${currentUsers} users found`}
                    options={JSON.stringify(UserListOptions)}
                    toParent={this.callbackSearch}
                    sort={this.state.sort}
                    order={this.state.order}
                    search={this.state.search}
                    placeholder="Search for an user"
                />
                <ProfileList
                    page={this.state.page}
                    sort={this.state.sort}
                    order={this.state.order}
                    search={this.state.search}
                    toParent={this.callbackLoad}
                />
                <PageList
                    current={this.state.page}
                    toParent={this.callbackPage}
                    maxpage={findMaxPage(currentUsers, 2).toString()}
                />
            </div>
        )
    }
}

class ProfileList extends React.Component{
    constructor(){
        super();
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            current_number: 0
        };
    }
    componentDidMount() {
        axios.get(`/users/find?sort=${this.props.sort}&order=${this.props.order}&search=${this.props.search}&page=${this.props.page}`)
            .then(res => {
                this.setState({
                    isLoaded: true,
                    items: res.data.profiles,
                    current_number: res.data.count,
                    my_name: res.data.my_name
                });
                this.props.toParent(res.data.count);
            })
            .catch(err => {
                this.setState({
                    isLoaded: true,
                    error: err
                });
            })
    }
    render(){
        if(this.state.isLoaded === false){
            return(<div>Loading ...</div>)
        }
        else if(this.state.error !== null){
            return (<div>Internal server error</div>)
        }
        else{
            const userList = this.state.items.map(user => {
                if(user.name !== this.state.my_name){
                    return(
                        <div>
                            <a href={`./profiles/${user.name}`}>
                                <div>
                                    <img src={user.thumbnail} alt={user.name} />
                                </div>
                                <div>
                                    {user.name}
                                </div>
                                <div>
                                    {user.joined}
                                </div>
                            </a>
                        </div>
                    )
                }
                else{
                    return(
                        <div>
                            <a href={`./profiles/my_profile`}>
                                <div>
                                    <img src={user.thumbnail} alt={user.name} />
                                </div>
                                <div>
                                    {user.name}
                                </div>
                                <div>
                                    {user.joined}
                                </div>
                            </a>
                        </div>
                    )
                }

            });
            return(
                <div>{userList}</div>
            )
        }
    }
}

export default Profiles;