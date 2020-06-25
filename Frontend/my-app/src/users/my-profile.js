import React from "react";
import BasicProfile from "./basic-profile";
import processEvent from "../useful_functions/process-event";
import processMessage from "../useful_functions/process-message";
import DateForm from "../search/date-form";
import TimeLine from "../display_components/timeline";
import SimpleList from "../display_components/simple-list";
import AnnotatedChart from "../display_components/annotated-chart";
import EventDict from "../language-display/timeline-classifier";
import axios from "axios";
import Modal from "react-modal";

class MyProfile extends React.Component{
    constructor(){
        super();
        const today = new Date();
        const tomorrow = new Date(today.setDate(today.getDate() + 1));
        this.state = {
            startGraph: new Date(today.setDate(0)).toISOString(),
            finalGraph: tomorrow.toISOString(),
            startList: new Date(today.setDate(0)).toISOString(),
            finalList: tomorrow.toISOString(),
            incomingWealth: null,
            incomingEvent1: null,
            incomingEvent2: null,
            requests: [],
            lastUpdate: new Date().getTime()
        };
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleTransaction = this.handleTransaction.bind(this);
        this.handleProfileCallback = this.handleProfileCallback.bind(this);
    }
    handleProfileCallback(wealth, requests){
        this.setState({
            incomingWealth: wealth,
            requests: requests
        })
    }
    handleDateChange(type, startDate, finalDate){
        switch(type){
            case 'graph':
                this.setState({
                   startGraph: startDate.toISOString(),
                   finalGraph: finalDate.toISOString()
                });
                break;
            case 'list':
                this.setState({
                    startList: startDate.toISOString(),
                    finalList: finalDate.toISOString()
                });
                break;
            default:
                this.setState({
                    startGraph: startDate.toISOString(),
                    finalGraph: finalDate.toISOString()
                });
                break;
        }
    }
    handleTransaction(data){
        this.setState({
            incomingWealth: data.userWealth,
            incomingEvent1: data.updateTimeline1,
            incomingEvent2: data.updateTimeline2,
            lastUpdate: new Date().getTime()
        });
    }
    render(){
        return(
            <div>
                <UserBasicProfile
                    wealth={this.state.incomingWealth}
                    toParent={this.handleProfileCallback}
                    lastUpdate={this.state.lastUpdate}
                />
                <UserEvents
                    eventType='graph'
                    toParent={this.handleDateChange}
                    lastUpdate={this.state.lastUpdate}
                    newEvent={this.state.incomingEvent1}
                />
                <RequestForm
                    wealth={this.state.incomingWealth}
                    requests={this.state.requests}
                />
                <DonateForm
                    toParent={this.handleTransaction}
                    timeline1Start={this.state.startGraph}
                    timeline1Final={this.state.finalGraph}
                    timeline2Start={this.state.startList}
                    timeline2Final={this.state.finalList}
                />
                <UserEvents
                    eventType='list'
                    toParent={this.handleDateChange}
                    lastUpdate={this.state.lastUpdate}
                    newEvent={this.state.incomingEvent2}
                />
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
            wealth: null
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
                this.props.toParent(res.wealth, res.requests);
            })
            .catch(err => {
                this.setState({
                    error: err
                })
            });
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (
            (this.state.isLoad !== nextState.isLoad)
            ||
            (this.props.lastUpdate !== nextState.lastUpdate)
            ||
            (this.state.wealth !== nextState.wealth)
        )
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.lastUpdate !== prevProps.lastUpdate){
            this.setState({
                wealth: this.props.wealth
            })
        }
    }
    render(){
        if(this.state.isLoad === false){
            return(<div>Loading ...</div>)
        }
        else{
            return(
                <BasicProfile
                    user={this.state.profile}
                    wealth={this.state.wealth}
                />
            )
        }
    }
}

class UserEvents extends React.Component{
    constructor(props){
        super(props);
        const today = new Date();
        const tomorrow = new Date(today.setDate(today.getDate() + 1));
        switch(props.eventType){
            case 'graph':
                this.state = {
                    isLoad: false,
                    error: null,
                    start: new Date(today.setDate(0)).toISOString(),
                    final: tomorrow.toISOString(),
                    timeline: null,
                    wealth: []
                };
                break;
            case 'list':
                this.state = {
                    isLoad: false,
                    error: null,
                    start: new Date(today.setDate(0)).toISOString(),
                    final: tomorrow.toISOString(),
                    timeline: null
                };
                break;
            default:
                this.state = {
                    isLoad: false,
                    error: null,
                    start: new Date(new Date().setDate(0)).toISOString(),
                    final: new Date().toISOString(),
                    timeline: null,
                    wealth: []
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
                    default:
                        this.setState({
                            timeline: res.timeline.map(event => {
                                return processEvent('ES', event)
                            }),
                            wealth: res.wealth_timetable,
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
            (this.state.start !== nextState.start)
            ||
            (this.state.final !== nextState.final)
            ||
            (this.props.lastUpdate !== nextProps.lastUpdate)
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
        else if(
            (this.props.lastUpdate !== prevProps.lastUpdate)
            &&
            (this.props.newEvent !== null)
        ){
            switch (this.props.eventType) {
                case 'graph':
                    const newGraph = this.state.timeline.slice();
                    newGraph.push(processEvent('ES', this.props.newEvent[1]));
                    const newWealth = this.state.wealth.slice();
                    newWealth.push(this.props.newEvent[0]);
                    this.setState({
                        timeline: newGraph,
                        wealth: newWealth
                    });
                    break;
                case 'list':
                    const newList = this.state.timeline.slice();
                    newList.push(processEvent('ES', this.props.newEvent))
                    this.setState({
                       timeline: newList
                    });
                    break;
                default:
                    const newDefaultGraph = this.state.timeline.slice();
                    newDefaultGraph.push(processEvent('ES', this.props.newEvent[1]));
                    const newDefaultWealth = this.state.wealth.slice().push();
                    newDefaultWealth.push(this.props.newEvent[0]);
                    this.setState({
                        timeline: newDefaultGraph,
                        wealth: newDefaultWealth
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
            const today = new Date();
            const tomorrow = new Date(today.setDate(today.getDate() + 1));
            if(this.props.eventType === 'graph') {
                return (
                    <div>
                        <section>
                            <DateForm
                                defaultStart = {this.state.start}
                                defaultFinal = {this.state.final}
                                minDate = {new Date('2020-01-01').getTime()}
                                maxDate = {tomorrow.getTime()}
                                toParent = {(startDate, finalDate) => this.handleDateChange(startDate, finalDate)}
                            />
                            <AnnotatedChart
                                tags = {
                                    [
                                        [
                                            EventDict['M']['legend-tags']['ES'],
                                            EventDict['M']['annotation-color']
                                        ],
                                        [
                                            EventDict['S']['legend-tags']['ES'],
                                            EventDict['S']['annotation-color']
                                        ],
                                        [
                                            EventDict['D']['legend-tags']['ES'],
                                            EventDict['D']['annotation-color']
                                        ],
                                        [
                                            EventDict['G']['legend-tags']['ES'],
                                            EventDict['G']['annotation-color']
                                        ]
                                    ]
                                }
                                title = "Your wealth's evolution"
                                yLabel = "Wealth ($)"
                                start = {new Date(this.state.start)}
                                end = {new Date(this.state.final)}
                                points = {this.state.wealth}
                                events = {this.state.timeline}
                            />
                        </section>
                    </div>
                )
            }
            else {
                const reverseTimeline = this.state.timeline.slice().reverse();
                return (
                    <div>
                        <section>
                            <DateForm
                                defaultStart = {this.state.start}
                                defaultFinal = {this.state.final}
                                minDate = {new Date('2020-01-01').getTime()}
                                maxDate = {tomorrow.getTime()}
                                toParent = {(startDate, finalDate) => this.handleDateChange(startDate, finalDate)}
                            />
                            <TimeLine
                                title = "Chad's awesome dids"
                                events = {reverseTimeline}
                            />
                        </section>
                    </div>
                )
            }
        }
    }
}

class DonateForm extends React.Component{
    constructor(){
        super();
        this.state = {
            donation: '',
            friendId: '',
            isConfirmModalVisible: false,
            isConfirmModalClickable: false,
            isMessageModalVisible: false,
            messageMain: null,
            messageList: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.makeDonation = this.makeDonation.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }
    handleChange(event){
        switch(event.target.id){
            case 'friendId':
                this.setState({
                   friendId: event.target.value
                });
                break;
            case 'donation':
                this.setState({
                    donation: event.target.value
                });
                break;
            default:
                this.setState({
                    donation: event.target.value
                });
                break;
        }
    }
    handleSubmit(event){
        if(
            (isNaN(this.state.donation) === true)
            ||
            (this.state.donation === 0)
            ||
            (this.state.donation === '')
        ){
            this.setState({
                isMessageModalVisible: true,
                messageMain: processMessage(
                'ES',
                ['Donation','isNaN']
                )
            });
            event.preventDefault();
        }
        else{
            this.setState({
                isConfirmModalVisible: true,
                isConfirmModalClickable: true
            });
            event.preventDefault();
        }
    }
    makeDonation(){
        this.setState({
            isConfirmModalVisible: false,
            isConfirmModalClickable: false
        });
        axios.post(
            '/users/donate',
            {
                friendId: this.state.friendId,
                transferredWealth: this.state.donation,
                timeline1Start: this.props.timeline1Start,
                timeline1Final: this.props.timeline1Final,
                timeline2Start: this.props.timeline2Start,
                timeline2Final: this.props.timeline2Final
            }
        )
            .then(res => {
                if(res.data.status === 'rejected'){
                    this.setState({
                        isMessageModalVisible: true,
                        messageMain: processMessage(
                            'ES',
                            ['Donation','main']
                        ),
                        messageList: Object.keys(res.data).filter(key => {
                            if(key === 'status'){
                                return false;
                            }
                            else if(res.data[key] === false){
                                return key
                            }
                            else{
                                return false;
                            }
                        })
                            .map(filteredKey => {
                                return(
                                    processMessage(
                                    'ES',
                                    ['Donation',filteredKey]
                                    )
                                )
                            })
                    });
                }
                else{
                    this.setState({
                        isMessageModalVisible: true,
                        messageMain:  `You donated ${this.state.donation}$ to ${this.state.friendId}`
                    });
                    this.props.toParent(res.data);
                }
            })
    }
    closeModal(){
        this.setState({
            isConfirmModalVisible: false,
            isConfirmModalClickable: false,
            isMessageModalVisible: false,
            messageMain: null,
            messageList: []
        })
    }
    render(){
        return(
            <div>
                <section>
                    <Modal
                        isOpen={this.state.isMessageModalVisible}
                    >
                        <div>
                            {this.state.messageMain}
                            <ul>
                                {this.state.messageList.map(message => {
                                    return <li key={message}>{message}</li>
                                })}
                            </ul>
                        </div>
                        <button onClick={() => {this.closeModal()}}>Ok</button>
                    </Modal>
                    <Modal isOpen={this.state.isConfirmModalVisible}>
                        <div>
                            You want to donate {this.state.donation}$ to {this.state.friendId}
                        </div>
                        <button onClick={() => {this.makeDonation()}}>Donate</button>
                        <button onClick={() => {this.closeModal()}}>Cancel</button>
                    </Modal>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            User:
                            <input
                                type='text'
                                id='friendId'
                                value={this.state.friendId}
                                onChange={this.handleChange}
                                placeholder="Select user's id"
                            />
                        </label>
                        <label>
                            Amount:
                            <input
                                type='text'
                                id='donation'
                                value={this.state.donation}
                                onChange={this.handleChange}
                                placeholder="Select an amount"
                            />
                        </label>
                        <input
                            type="submit"
                            value="Submit"
                        />
                    </form>
                </section>
            </div>
        )
    }
}

class RequestForm extends React.Component{
    constructor(props){
        super(props);
        if(props.wealth > 5){
            this.state = {
                allowedRequests: [5, 10, 20, 25, 50, 100].filter(price => {
                    return props.wealth/price >= 1;
                }),
                selectedRequest: 5
            };
            this.handleChange = this.handleChange.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
        }
        else{
            this.state = {
                allowedRequests: [],
                selectedRequest: null
            };
        }
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return(
            (this.props.wealth !== nextProps.wealth)
            ||
            (this.props.requests !== nextProps.requests)
        )
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.wealth > 5){
            this.state = {
                allowedRequests: [5, 10, 20, 25, 50, 100].filter(price => {
                    return this.props.wealth/price >= 1;
                }),
                selectedRequest: 5
            };
            this.handleChange = this.handleChange.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
        }
    }
    handleChange(event){
        this.setState({
            selectedRequest: event.target.value
        })
    }
    handleSubmit(event){
        event.preventDefault();
    }
    render(){
        if(this.props.wealth < 5){
            return(
                <div>
                    <section>
                    <SimpleList
                        title="Current requests"
                        list={this.props.requests.map(request => {
                            return(
                                <div>
                                    {request.request_date.slice(0,10)}
                                    {request.request_date.slice(11,19)}
                                    {request.request_cash}
                                </div>
                            )
                        })}
                        useLinks={false}
                    />
                    <div>
                        Not enough cash to retrieve
                    </div>
                    </section>
                </div>
            )
        }
        else{
            return(
                <div>
                    <section>
                        <SimpleList
                            title="Current requests"
                            list={this.props.requests.map(request => {
                                return(
                                    <div>
                                        {request.request_date.slice(0,10)}
                                        {request.request_date.slice(11,19)}
                                        {request.request_cash}
                                    </div>
                                )
                            })}
                            useLinks={true}
                        />
                        <div>
                            <form onSubmit={this.handleSubmit}>
                                <select
                                    id="cash"
                                    value={this.state.selectedRequest}
                                    onChange={this.handleChange}
                                >
                                    {this.state.allowedRequests.map(request => {
                                        return(
                                            <option>request</option>
                                        )
                                    })}
                                </select>
                                <input type="submit" value="Submit" />
                            </form>
                        </div>
                    </section>
                </div>
            )
        }
    }
}
export default MyProfile;