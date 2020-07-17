//Standard
import React from "react";

//Packages
import axios from "axios";

//Local components
import BasicProfile from "./basic-profile";
import DateForm from "../search/date-form";
import TimeLine from "../display-components/timeline";

//Useful functions
import processEvent from "../useful-functions/process-event";
import getLocalDate from "../useful-functions/date-offset";

//Language jsons
import otherDict from "../language-display/other-classifier";
import messageDict from "../language-display/message-classifier";

//Context
import LanguageContext from "../language-context";
import processMessage from "../useful-functions/process-message";


class FriendProfile extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            exists: undefined
        }
    }
    componentDidMount() {
        const { steamid } = this.props.match.params;
        axios.get(`/users/profiles/${steamid}/exists`)
            .then(() => {
                this.setState({exists: true})
            })
            .catch(() => {
                this.setState({exists: false})
            })
    }
    render(){
        const { steamid } = this.props.match.params;
        if(this.state.exists === undefined){
            return(<div>{messageDict['Search']['user-exists'][this.context]}</div>)
        }
        else if(this.state.exists === false){
            return(<div>{messageDict['Search']['user-404'][this.context]}</div>)
        }
        else{
            return(
                <div>
                    <FriendBasicProfile steamid={steamid} />
                    <FriendEvents steamid={steamid} />
                </div>
            )
        }
    }
}
FriendProfile.contextType = LanguageContext;

class FriendBasicProfile extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isLoaded: false,
            user: null,
            error: false
        }
    }
    componentDidMount() {
        axios.get(`/users/profiles/${this.props.steamid}/profile`)
            .then(res => {
                this.setState({
                    isLoaded: true,
                    user: res.data
                });

            })
            .catch(() => {
                this.setState({
                    error: true,
                    isLoaded: true
                });
            })
    }
    render(){
        if(this.state.isLoaded === false){
            return <div>Loading profile...</div>
        }
        else if(this.state.error === true){
            return(<div>{messageDict['Search']['user-404'][this.context]}</div>)
        }
        else{
            return(
                <BasicProfile
                    person='3rd'
                    user={this.state.user}
                    wealth={this.state.user.wealth}
                />
            )
        }
    }
}

class FriendEvents extends React.Component{
    constructor(props){
        super(props);
        const today = getLocalDate(new Date());
        const tomorrow = new Date(today.setDate(today.getDate() + 1));
        const monthAgo = new Date(today.setMonth(today.getMonth()-1));
        this.state = {
            isLoad: false,
            error: null,
            start: monthAgo.toISOString(),
            final: tomorrow.toISOString(),
            timeline: null
        };
        this.updateTimeline = this.updateTimeline.bind(this);
    }
    updateTimeline(){
        fetch(
            `/users/profiles/${this.props.steamid}/timeline?start=${this.state.start}&end=${this.state.final}`
        )
            .then(res => res.json())
            .then(res => {
                this.setState({
                    timeline: res.timeline.map(event => {
                        return (
                            processEvent(this.context, "3rd", event)
                        )
                    }),
                    minDate: getLocalDate(new Date(res.joined)),
                    isLoad: true
                });
            })
            .catch(err => {
                console.log(err);
                this.setState({
                    error: err
                })
            })
    }
    handleDateChange(startDate, finalDate){
        this.setState({
            start: startDate,
            final: finalDate,
            isLoad: false
        });
    }
    componentDidMount() {
        this.updateTimeline()
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return(
            (this.state.start !== nextState.start)
            ||
            (this.state.final !== nextState.final)
            ||
            (this.state.timeline !== nextState.timeline)
            ||
            (this.state.isLoad !== nextState.isLoad)
        )
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        if(
            (prevState.start !== this.state.start)
            ||
            (prevState.final !== this.state.final)
        ){
            this.updateTimeline()
        }
    }
    render(){
        if(this.state.error !== null){
            return(
                <div>Internal server error</div>
        )
        }
        else if(this.state.isLoad === false){
            return(
                <div>Loading ...</div>
        )
        }
        else{
            const today = getLocalDate(new Date());
            const tomorrow = new Date(today.setDate(today.getDate() + 1));
            const reverseTimeline = this.state.timeline.slice().reverse();
            return (
                <div>
                    <section>
                        <h2>{otherDict['profile']['timeline-list-title-user'][this.context]}</h2>
                        <DateForm
                            defaultStart = {this.state.start}
                            defaultFinal = {this.state.final}
                            minDate = {this.state.minDate}
                            maxDate = {tomorrow.getTime()}
                            toParent = {(startDate, finalDate) => this.handleDateChange(startDate, finalDate)}
                        />
                        {this.state.timeline.length === 0? (
                            <div>{processMessage(this.context, ['Timeline','no-list'])}</div>
                        ) : (
                            <TimeLine
                                events = {reverseTimeline}
                            />
                        )}
                    </section>
                </div>
            )
        }
    }
}
FriendEvents.contextType = LanguageContext;

export default FriendProfile;