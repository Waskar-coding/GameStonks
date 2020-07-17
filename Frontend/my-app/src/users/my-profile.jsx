//Standard
import React from "react";

//Packages
import axios from "axios";
import Modal from "react-modal";
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';

//Useful functions
import processEvent from "../useful-functions/process-event";
import processMessage from "../useful-functions/process-message";
import getLocalDate from "../useful-functions/date-offset";
import configDefaultXAxes from "../useful-functions/xaxes-default-config";
import configDefaultTooltips from "../useful-functions/tooltips-default-config";

//Local components
import DateForm from "../search/date-form";
import TimeLine from "../display-components/timeline";
import SimpleList from "../display-components/simple-list";
import AnnotatedChart from "../display-components/annotated-chart";
import BasicProfile from "./basic-profile";

//Language jsons
import eventDict from "../language-display/timeline-classifier";
import interactiveDict from "../language-display/interactive-classifier";
import otherDict from "../language-display/other-classifier";

//Context
import LanguageContext from "../language-context";


class MyProfile extends React.Component{
    constructor(props){
        super(props);
        const today = getLocalDate(new Date());
        const tomorrow = new Date(today.setDate(today.getDate() + 1));
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
        this.state = {
            isChecked: false,
            isAuth: false,
            startGraph: monthAgo.toISOString(),
            finalGraph: tomorrow.toISOString(),
            startList: monthAgo.toISOString(),
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
    componentDidMount() {
        fetch('/users/verify')
            .then(res => res.json())
            .then(res =>{
                this.setState({
                    isChecked: true,
                    isAuth: res.auth === true
                });
            })
    }
    handleProfileCallback(wealth, requests){
        this.setState({
            incomingWealth: wealth,
            requests: requests
        });
    }
    handleDateChange(type, startDate, finalDate){
        if(type === 'list') {
            this.setState({
                startList: startDate.toISOString(),
                finalList: finalDate.toISOString()
            });
        }
        else{
            this.setState({
                startGraph: startDate.toISOString(),
                finalGraph: finalDate.toISOString()
            });
        }
    }
    handleTransaction(data){
        this.setState({
            incomingWealth: data.userWealth,
            incomingEvent1: data.updateTimeline1,
            incomingEvent2: data.updateTimeline2,
            lastUpdate: new Date().getTime()
        });
        if(data.request){
            const newRequestList = this.state.requests.slice();
            newRequestList.push(data.request);
            this.setState({
                requests: newRequestList
            });
        }
    }
    render(){
        if(this.state.isChecked === false){
            return(<div>Checking your profile ...</div>)
        }
        else if(this.state.isAuth === true){
            return(
                <div>
                    <UserBasicProfile
                        toParent={this.handleProfileCallback}
                        wealth={this.state.incomingWealth}
                        lastUpdate={this.state.lastUpdate}
                    />
                    <h2>{otherDict['profile']['timeline-graph-title'][this.context]}</h2>
                    <UserEvents
                        toParent={this.handleDateChange}
                        eventType='graph'
                        lastUpdate={this.state.lastUpdate}
                        newEvent={this.state.incomingEvent1}
                    />
                    <h2>{otherDict['profile']['requests-title'][this.context]}</h2>
                    <RequestForm
                        toParent={this.handleTransaction}
                        wealth={this.state.incomingWealth}
                        requests={this.state.requests}
                        timeline1Start={this.state.startGraph}
                        timeline1Final={this.state.finalGraph}
                        timeline2Start={this.state.startList}
                        timeline2Final={this.state.finalList}
                    />
                    <h2>{otherDict['profile']['donation-title'][this.context]}</h2>
                    <DonateForm
                        toParent={this.handleTransaction}
                        timeline1Start={this.state.startGraph}
                        timeline1Final={this.state.finalGraph}
                        timeline2Start={this.state.startList}
                        timeline2Final={this.state.finalList}
                    />
                    <a href='../../documents/steamid'>
                        {otherDict['profile']['steamid-info-link'][this.context]}
                    </a>
                    <h2>{otherDict['profile']['timeline-list-title-my'][this.context]}</h2>
                    <UserEvents
                        toParent={this.handleDateChange}
                        eventType='list'
                        lastUpdate={this.state.lastUpdate}
                        newEvent={this.state.incomingEvent2}
                    />
                </div>
            )
        }
        else{
            return(
                <div>You are not authenticated</div>
            )
        }
    }
}
MyProfile.contextType = LanguageContext;

class UserBasicProfile extends React.Component{
    constructor(props){
        super(props);
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
                    person='1st'
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
        const today = getLocalDate(new Date());
        const tomorrow = new Date(today.setDate(today.getDate() + 1));
        const monthAgo = new Date(today.setMonth(today.getMonth()-1));
        if(props.eventType === 'list'){
            this.state = {
                isLoad: false,
                error: null,
                start: monthAgo.toISOString(),
                final: tomorrow.toISOString(),
                timeline: null,
                minDate: null
            };
        }
        else{
            this.state = {
                isLoad: false,
                error: null,
                start: monthAgo.toISOString(),
                final: tomorrow.toISOString(),
                timeline: null,
                wealth: [],
                minDate: null
            };
        }
        this.updateTimeline = this.updateTimeline.bind(this);
    }
    updateTimeline(){
        fetch(
            `/users/my_timeline?start=${this.state.start}&end=${this.state.final}&type=${this.props.eventType}`
        )
            .then(res => res.json())
            .then(res => {
                if(this.props.eventType === 'list'){
                    this.setState({
                        timeline: res.timeline.map(event => {
                            return processEvent(this.context, '1st', event)
                        }),
                        minDate: getLocalDate(new Date(res.joined)),
                        isLoad: true
                    });
                }
                else{
                    this.setState({
                        timeline: res.timeline.map(event => {
                            return processEvent(this.context, '1st', event)
                        }),
                        wealth: res.wealth_timetable.map(point => {
                            return {x: getLocalDate(new Date(point[0])).getTime(), y: point[1]}
                        }),
                        minDate: getLocalDate(new Date(res.joined)),
                        isLoad: true
                    });
                }
            })
            .catch(err => {
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
            if(this.props.eventType === 'list'){
                const newList = this.state.timeline.slice();
                newList.push(processEvent(this.context, '1st', this.props.newEvent));
                this.setState({
                    timeline: newList
                });
            }
            else {
                const newDefaultGraph = this.state.timeline.slice();
                newDefaultGraph.push(processEvent(this.context, '1st', this.props.newEvent[1]));
                const newDefaultWealth = this.state.wealth.slice();
                newDefaultWealth.push(
                    {
                        x: getLocalDate( new Date(this.props.newEvent[0][0])),
                        y: this.props.newEvent[0][1]
                    }
                );
                this.setState({
                    timeline: newDefaultGraph,
                    wealth: newDefaultWealth
                });
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
            const today = getLocalDate(new Date());
            const tomorrow = new Date(today.setDate(today.getDate() + 1));
            return(
                <div>
                    <section>
                        <DateForm
                            defaultStart = {this.state.start}
                            defaultFinal = {this.state.final}
                            minDate = {this.state.minDate}
                            maxDate = {tomorrow.getTime()}
                            toParent = {(startDate, finalDate) => this.handleDateChange(startDate, finalDate)}
                        />
                        {this.props.eventType === 'graph'? (
                            this.state.wealth.length === 0? (
                                <div>{processMessage(this.context,["Timeline","no-graph"])}</div>
                            ) : (
                                <AnnotatedChart
                                    tooltips={configDefaultTooltips('$')}
                                    xAxes={
                                        configDefaultXAxes(
                                            new Date(this.state.start),
                                            new Date(this.state.final),
                                            this.context
                                        )
                                    }
                                    tags = {
                                        [
                                            [
                                                eventDict['M']['legend-tags']['ES'],
                                                eventDict['M']['annotation-color']
                                            ],
                                            [
                                                eventDict['S']['legend-tags']['ES'],
                                                eventDict['S']['annotation-color']
                                            ],
                                            [
                                                eventDict['D']['legend-tags']['ES'],
                                                eventDict['D']['annotation-color']
                                            ],
                                            [
                                                eventDict['G']['legend-tags']['ES'],
                                                eventDict['G']['annotation-color']
                                            ],
                                            [
                                                eventDict['R']['legend-tags']['ES'],
                                                eventDict['R']['annotation-color']
                                            ]
                                        ]
                                    }
                                    title = "Your wealth's evolution"
                                    yLabel = {otherDict['chart']['y-label-money'][this.context]}
                                    start = {new Date(this.state.start)}
                                    end = {new Date(this.state.final)}
                                    points = {this.state.wealth}
                                    events = {this.state.timeline}
                                />
                            )
                        ) : (
                            this.state.timeline.length === 0? (
                                <div>{processMessage(this.context,["Timeline","no-list"])}</div>
                            ) : (
                                <TimeLine events = {this.state.timeline.slice().reverse()} />
                            )
                        )}
                    </section>
                </div>
            )
        }
    }
}
UserEvents.contextType = LanguageContext;

class DonateForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            donation: '',
            friendId: '',
            friendName: '',
            friendThumbnail: '',
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
        let allowedDecimals = true;
        if(this.state.donation.includes('.')){
            allowedDecimals = this.state.donation.split('.')[1].length < 3;
        }
        if(
            (allowedDecimals === false)
            ||
            (this.state.donation.includes('e') === true)
            ||
            (isNaN(this.state.donation) === true)
            ||
            (this.state.donation === 0)
            ||
            (this.state.donation === '')
        ){
            event.preventDefault();
            this.setState({
                isMessageModalVisible: true,
                messageMain: processMessage(
                this.context,
                ['Donation','isNaN']
                )
            });
        }
        else if(this.state.friendId === ""){
            event.preventDefault();
            this.setState({
                isMessageModalVisible: true,
                messageMain: processMessage(
                    this.context,
                    ['Donation','isRegistered']
                )
            });
        }
        else{
            event.preventDefault();
            fetch(`/users/simple/${this.state.friendId}`)
                .then(res => res.json())
                .then(res => {
                    if(res.status === 'Success'){
                        this.setState({
                            isConfirmModalVisible: true,
                            isConfirmModalClickable: true,
                            friendName: res.name,
                            friendThumbnail: res.thumbnail
                        });
                    }
                    else{
                        this.setState({
                            isMessageModalVisible: true,
                            messageMain: processMessage(
                                this.context,
                                ['Donation','isRegistered']
                            )
                        });
                    }
                })
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
                            this.context,
                            ['Donation','main-error']
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
                                    this.context,
                                    ['Donation',filteredKey]
                                    )
                                )
                            })
                    });
                }
                else{
                    this.setState({
                        isMessageModalVisible: true,
                        messageMain:  processMessage(
                            this.context,
                            ['Donation','success', this.state.donation, this.state.friendName]
                        )
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
                            <img src={this.state.friendThumbnail} alt='User thumbnail' />
                            {processMessage(
                                this.context,
                                ['Donation','confirm', this.state.donation, this.state.friendName])
                            }
                        </div>
                        <button onClick={() => {this.makeDonation()}}>
                            {interactiveDict['donation-form']['donation-confirm'][this.context]}
                        </button>
                        <button onClick={() => {this.closeModal()}}>
                            {interactiveDict['donation-form']['donation-cancel'][this.context]}
                        </button>
                    </Modal>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            {interactiveDict['donation-form']['user-id'][this.context]}:
                            <input
                                type='text'
                                id='friendId'
                                value={this.state.friendId}
                                onChange={this.handleChange}
                                placeholder={interactiveDict['donation-form']['user-id-placeholder'][this.context]}
                            />
                        </label>
                        <label>
                            {interactiveDict['donation-form']['donation'][this.context]}:
                            <input
                                type='text'
                                id='donation'
                                value={this.state.donation}
                                onChange={this.handleChange}
                                placeholder={interactiveDict['donation-form']['donation-placeholder'][this.context]}
                            />
                        </label>
                        {(this.state.isMessageModalVisible === true) || (this.state.isConfirmModalVisible === true) ? (
                            <input
                                type="submit"
                                value={interactiveDict['donation-form']['donation-submit'][this.context]}
                            />
                        ) : (
                            <Tippy content={interactiveDict['donation-form']['tooltip'][this.context]}>
                                <input
                                    type="submit"
                                    value={interactiveDict['donation-form']['donation-submit'][this.context]}
                                />
                            </Tippy>
                        )}
                    </form>
                </section>
            </div>
        )
    }
}
DonateForm.contextType = LanguageContext;

class RequestForm extends React.Component{
    constructor(props){
        super(props);
        if(props.wealth > 5){
            this.state = {
                allowedRequests: [5, 10, 20, 25, 50, 100].filter(price => {
                    return props.wealth/price >= 1;
                }),
                selectedRequest: 5,
                isMessageModalVisible: false,
                isConfirmModalVisible: false,
                isConformModalClickable: false
            };
        }
        else{
            this.state = {
                allowedRequests: [],
                selectedRequest: 5,
                isMessageModalVisible: false,
                isConfirmModalVisible: false,
                isConformModalClickable: false
            };
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.makeRequest = this.makeRequest.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return(
            (this.props.wealth !== nextProps.wealth)
            ||
            (this.props.requests !== nextProps.requests)
            ||
            (this.state.allowedRequests !== nextState.allowedRequests)
            ||
            (this.state.selectedRequest !== nextState.selectedRequest)
            ||
            (this.state.isConfirmModalVisible !== nextState.isConfirmModalVisible)
            ||
            (this.state.isConfirmModalClickable !== nextState.isConfirmModalClickable)
            ||
            (this.state.isMessageModalVisible !== nextState.isMessageModalVisible)
        )
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(
            (this.props.wealth >= 5)
            &&
            (this.props.wealth !== prevProps.wealth)
        ){
            this.setState({
                allowedRequests: [5, 10, 20, 25, 50, 100].filter(price => {
                    return this.props.wealth/price >= 1;
                })
            });
        }
    }
    handleChange(event){
        this.setState({
            selectedRequest: event.target.value
        });
    }
    handleSubmit(event){
        event.preventDefault();
        this.setState({
            isConfirmModalVisible: true,
            isConfirmModalClickable: true
        });
    }
    closeModal(){
        this.setState({
            isMessageModalVisible: false,
            isConfirmModalVisible: false,
            isConfirmModalClickable: false
        });
    }
    makeRequest(){
        const initialRequest = this.state.selectedRequest;
        this.setState({
            isConfirmModalVisible: false,
            isConfirmModalClickable: false
        });
        axios.post(
            '/users/request',
            {
                request: this.state.selectedRequest,
                timeline1Start: this.props.timeline1Start,
                timeline1Final: this.props.timeline1Final,
                timeline2Start: this.props.timeline2Start,
                timeline2Final: this.props.timeline2Final
            }
        )
            .then(res => {
                this.setState({
                    isMessageModalVisible: true,
                    selectedRequests: initialRequest
                });
                this.props.toParent(res.data);
            })
    }
    render(){
        return(
            <div>
                <section>
                    <Modal isOpen={this.state.isMessageModalVisible}>
                        <div>
                            <div>
                                {processMessage(this.context,['Request','success',this.state.selectedRequest])}
                            </div>
                            <button onClick={() => {this.closeModal()}}>Ok</button>
                        </div>
                    </Modal>
                </section>
                <Modal isOpen={this.state.isConfirmModalVisible}>
                    <div>
                        <div>
                            {processMessage(this.context,['Request','confirm'])}
                        </div>
                        <button onClick={() => {this.makeRequest()}}>
                            {interactiveDict['request-form']['confirm'][this.context]}
                        </button>
                        <button onClick={() => {this.closeModal()}}>
                            {interactiveDict['request-form']['cancel'][this.context]}
                        </button>
                    </div>
                </Modal>
                <SimpleList
                    title={otherDict['profile']['requests-list'][this.context]}
                    list={this.props.requests.map(request => {
                        return(
                            <div>
                                {getLocalDate(new Date(request.request_date)).toISOString().slice(0,10)}
                                {' '}
                                {request.request_cash}
                                {'$'}
                            </div>
                        )
                    })}
                    useLinks={false}
                    target={null}
                />
                {(this.props.wealth >= 5) && (this.props.requests.length < 3)? (
                    <div>
                        <form onSubmit={this.handleSubmit}>
                            <label>
                                {interactiveDict['request-form']['amount'][this.context]}:
                                <select
                                    id="cash"
                                    value={this.state.selectedRequest}
                                    onChange={this.handleChange}
                                >
                                    {this.state.allowedRequests.map(request => {
                                        return(
                                            <option key={request} value={request}>{request}$</option>
                                        )
                                    })}
                                </select>
                            </label>
                            {(this.state.isMessageModalVisible) || (this.state.isConfirmModalVisible)?(
                                <input
                                    type="submit"
                                    value={interactiveDict['request-form']['confirm'][this.context]}
                                />
                            ) : (
                                <Tippy content={interactiveDict['request-form']['tooltip'][this.context]}>
                                    <input
                                        type="submit"
                                        value={interactiveDict['request-form']['confirm'][this.context]}
                                    />
                                </Tippy>
                            )}

                        </form>
                    </div>
                ):(
                    (this.props.wealth <= 5)? (
                        <div>{processMessage('ES',['Request','cash'])}</div>
                    ):(
                        <div>{processMessage(this.context,['Request','limit'])}</div>
                    )
                )}
            </div>
        )
    }
}
RequestForm.contextType = LanguageContext;

export default MyProfile;