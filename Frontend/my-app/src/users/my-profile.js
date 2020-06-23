import React from "react";
import BasicProfile from "./basic-profile";
import processEvent from "../useful_functions/process-event";
import DateForm from "../search/date-form";
import TimeLine from "../display_components/timeline";
import AnnotatedChart from "../display_components/annotated-chart";
import axios from "axios";
import Modal from "react-modal";

class MyProfile extends React.Component{
    constructor(){
        super();
        this.state = {
            startGraph: new Date(new Date().setDate(0)).toISOString(),
            finalGraph: new Date().toISOString(),
            startList: new Date(new Date().setDate(0)).toISOString(),
            finalList: new Date().toISOString(),
            incomingWealth: null,
            wealth: 0
        };
        this.handleDateChange = this.handleDateChange.bind(this);
    }
    handleDateChange(type, startDate, finalDate){
        switch(type){
            case 'graph':
                this.setState({
                   startGraph: startDate,
                   finalGraph: finalDate
                });
                break;
            case 'list':
                this.setState({
                    startList: startDate,
                    finalList: finalDate
                });
                break;
        }
    }
    componentDidMount(){}
    render(){
        return(
            <div>
                <UserBasicProfile />
                <UserEvents eventType='graph' />
            </div>
        )
    }
}

class UserBasicProfile extends React.Component{
    constructor(){
        super();
        this.state = {
            error: false,
            isLoad: false,
            profile: null,
            wealth: 0
        }
    }
    componentDidMount() {
        fetch(
            '/users/my_profile'
        )
            .then(res => res.json())
            .then(res => {
                this.setState({
                    isLoad: true,
                    profile: res,
                    wealth: res.wealth
                });
            })
            .catch(err => {
                this.setState({
                    error: err
                })
            });
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (
            (this.props.wealth !== nextProps.wealth)
            ||
            (this.state.isLoad !== nextState.isLoad)
        )
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.setState({
            wealth: this.props.wealth
        })
    }
    render(){
        if(this.state.isLoad === false){
            return(<div>Loading ...</div>)
        }
        else{
            const profile = this.state.profile;
            profile.wealth = this.state.wealth;
            return(<BasicProfile user={profile} />)
        }
    }
}

class UserEvents extends React.Component{
    constructor(props){
        super(props);
        switch(props.eventType){
            case 'graph':
                this.state = {
                    isLoad: false,
                    error: null,
                    start: new Date(new Date().setDate(0)).toISOString(),
                    final: new Date().toISOString(),
                    timeline: null,
                    wealth: []
                };
                break;
            case 'list':
                this.state = {
                    isLoad: false,
                    error: null,
                    start: new Date(new Date().setDate(0)).toISOString(),
                    final: new Date().toISOString(),
                    timeline: null
                };
                break;
        }
        this.updateTimeline = this.updateTimeline.bind(this);
    }
    updateTimeline(){
        fetch(
            `/users/my_timeline?start=${this.state.start}&end=${this.state.final}&type=${this.props.eventType}`
        )
            .then(res => res.json())
            .then(res => {
                switch(this.props.eventType){
                    case 'graph':
                        this.setState({
                            timeline: res.timeline.map(event => {
                                return processEvent('ES', event)
                            }),
                            wealth: res.wealth_timetable,
                            isLoad: true
                        });
                        break;
                    case 'list':
                        this.setState({
                            timeline: res.timeline.map(event => {
                                return processEvent('ES', event)
                            }),
                            isLoad: true
                        });
                        break;
                }
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
        this.props.toParent(this.props.eventType, startDate, finalDate);
    }
    componentDidMount() {
        this.updateTimeline()
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return(
            (this.state.start === nextState.start)
            ||
            (this.state.final === nextState.final)
            ||
            (
                (this.props.incomingEvent !== nextProps.incomingEvent)
                &&
                (nextProps.incomingEvent !== null)
            )
        )
    }
    componentDidUpdate(prevState){
        if(
            (prevState.start !== this.state.start)
            ||
            (prevState.final !== this.state.final)
        ){
            this.updateTimeline()
        }
        else{
            switch(this.props.eventType){
                case 'graph':
                    this.setState({
                        timeline:  this.state.timeline.push(
                            processEvent('ES', this.props.incomingEvent[1])
                        ),
                        wealth: this.state.wealth.push(this.props.incomingEvent[0])
                    });
                    break;
                case 'list':
                    this.setState({
                        timeline:  this.state.timeline.push(
                            processEvent('ES', this.props.incomingEvent)
                        )
                    });
                    break;
            }
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
            switch(this.props.eventType){
                case 'graph':
                    return(
                        <div>
                            <DateForm
                                defaultStart={new Date().setDate(0)}
                                defaultFinal={new Date().getTime()}
                                minDate={new Date('2020-01-01').getTime()}
                                toParent={(startDate,finalDate) => this.handleDateChange(startDate,finalDate)}
                            />
                            <AnnotatedChart
                                tags={[
                                    ['Multiplier', 'blue'],
                                    ['Strike', 'orange'],
                                    ['Register', 'purple']
                                ]}
                                title="Your wealth's evolution"
                                yLabel="Wealth ($)"
                                start={new Date(this.state.timeline1Start)}
                                end={new Date(this.state.timeline1Final)}
                                points={this.state.wealth}
                                events={this.state.timeline1}
                            />
                        </div>
                    )
                    break;
                case 'list':
                    return(
                        <div>
                            <DateForm
                                defaultStart={new Date().setDate(0)}
                                defaultFinal={new Date().getTime()}
                                minDate={new Date('2020-01-01').getTime()}
                                toParent={(startDate,finalDate) => this.handleDateChange(startDate,finalDate)}
                            />
                            <TimeLine
                                title="Chad's awesome dids"
                                events={this.state.timeline2}
                            />
                        </div>
                    )
                    break;
            }
        }
    }
}

export default MyProfile;