import React from "react";
import axios from "axios";
import BasicProfile from "./basic-profile";

class UserProfile extends React.Component{
    constructor(){
        super();
        this.state = {
            isLoaded: false,
            user: null,
            selectedGame: null,
            error: false
        }
    }
    componentDidMount() {
        const { name } = this.props.match.params;
        axios.get(`/users/profiles/${name}`)
            .then(res => {
                this.setState({
                    isLoaded: true,
                    user: res.data
                })
            })
            .catch(err => {
                this.setState({
                    error: true,
                    isLoaded: true
                })
            })
    }
    render(){
        if(this.state.isLoaded === false){
            return <div>Loading profile...</div>
        }
        else if(this.state.error === true){
            return null
        }
        else{
            return(<BasicProfile user={this.state.user} />)
        }
    }
}

export default UserProfile;