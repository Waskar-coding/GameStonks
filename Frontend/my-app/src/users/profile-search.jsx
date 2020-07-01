//Standard
import React from "react";

//Packages
import axios from "axios";

//Local Components
import Search from "../search/search-main";

//Language jsons
import messageDict from "../language-display/message-classifier";
import interactiveDict from "../language-display/interactive-classifier";

//Context
import LanguageContext from "../language-context";
import getLocalDate from "../useful_functions/date-offset";

class Profiles extends React.Component{
    render(){
        return(
            <Search
                defaultSort="name"
                displayPerPage = "2"
                message="user-message"
                placeholder="user-placeholder"
                tooltip="user-tooltip"
                options={JSON.stringify({
                    name: interactiveDict['search-form']['user-name'][this.context],
                    joined: interactiveDict['search-form']['user-date'][this.context]
                })}
                location={this.props.location}
            >
                <ProfileList />
            </Search>
        )
    }
}
Profiles.contextType = LanguageContext;


class ProfileList extends React.Component{
    constructor(props){
        super(props);
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
        else if(this.state.items.length === 0){
            return(<div>{messageDict['Search']['users-404'][this.context]}</div>)
        }
        else{
            return(
                <div>
                    <section>
                        <nav>
                            <ul style={{listStyleType: "none"}}>
                                {this.state.items.map(user => {
                                    if(user.name !== this.state.my_name){
                                        return(
                                            <li key={user.thumbnail}>
                                                <div>
                                                    <a href={`./profiles/${user.steamid}`}>
                                                        <div>
                                                            <img src={user.thumbnail} alt={user.name} />
                                                        </div>
                                                        <div>
                                                            {user.name}
                                                        </div>
                                                        <div>
                                                            {getLocalDate(new Date(user.joined)).toISOString().slice(0,10)}
                                                        </div>
                                                    </a>
                                                </div>
                                            </li>
                                        )
                                    }
                                    else{
                                        return(
                                            <li key={user.thumbnail}>
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
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </nav>
                    </section>
                </div>
            )
        }
    }
}

ProfileList.contextType = LanguageContext;

export default Profiles;