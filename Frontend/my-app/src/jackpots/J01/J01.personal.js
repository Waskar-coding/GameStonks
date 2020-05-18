import React from "react";
import {Line, Bar} from "react-chartjs-2";
import MultiplierRouter from "../../multipliers/MultiplierRouter";

class J01Personal extends React.Component{
    constructor(){
        super();
        this.state = {
            isLoaded: false,
            isError: false,
            isAuth: false,
            jackpotIndex: null,
            user: null
        };
        this.handleMultiplierCallback = this.handleMultiplierCallback.bind(this);
    }
    componentDidMount(){
        fetch(`../../users/my_profile`)
            .then(res => res.json())
            .then(
                (res) => {
                    if(res.jackpots){
                        this.setState({
                            isAuth: true,
                            user: res,
                            isLoaded:true
                        });
                        for(let i=0; i<res.jackpots.length; i++){
                            if(res.jackpots[i].jackpot_id === this.props.jackpotId){
                                this.setState({
                                    jackpotIndex: i
                                });
                                break;
                            }
                        }
                    }
                },
                (error) => {
                    this.setState({
                        isError: true,
                        isLoaded: true
                    })
                }
            )
    }
    handleMultiplierCallback(user){
        this.setState({
            user: user
        });
    }
    render(){
        const isLoaded = this.state.isLoaded;
        const isError = this.state.isError;
        const isAuth = this.state.isAuth;
        const isUser = this.state.jackpotIndex !== null;
        let renderContent;
        if(isLoaded === false){
            renderContent = <div>Loading...</div>
        }
        else if(isError === true){
            renderContent = <div>This jackpot requires Steam authentication, please authenticate through Steam to participate. If you where already authenticated an internal server error may have ocurred your personal and stats could not be loaded, if so, we are already working to provide a solution.</div>;
        }
        else if(isUser === false){
            renderContent = <div>You are not currently participating in the jackpot</div>;
        }
        else{
            if(this.state.user.jackpots[this.state.jackpotIndex].status === 'a'){
                const jackpot = this.state.user.jackpots[this.state.jackpotIndex];
                const jackpotMonitored = [];
                for(let game of this.state.user.monitored){
                    if(game.register_date >= jackpot.date){
                        jackpotMonitored.push(game);
                    }
                }
                renderContent = <div>
                        <div><J01PersonalResume user={this.state.user} jackpot={jackpot} monitored={jackpotMonitored} /></div>
                        <div><MultiplierRouter jackpotId={jackpot.jackpot_id} userMultipliers={this.state.user.multipliers} jackpotMultipliers={jackpot.multipliers} toParent={this.handleMultiplierCallback}/></div>
                        <div><J01PersonalGraph points={jackpot.share_timetable} title="Your share's evolution" yLabel="Share ($)" /></div>
                        <div><J01PersonalTimeline monitored={jackpotMonitored} jackpot={jackpot} /></div>
                    </div>;
            }
            else{
                renderContent = <div>You where kicked from this jackpot</div>;
            }
        }
        return(<div>{renderContent}</div>)
    }
}

class J01PersonalResume extends React.Component{
    render(){
        const jackpot = this.props.jackpot;
        const userName = this.props.user.name;
        const userThumbnail = this.props.user.thumbnail;
        return(
            <div>
                <div><img src={userThumbnail} alt="Your steam thumbnail" /></div>
                <div>
                    <div><h1>{userName}</h1></div>
                    <table>
                        <tr>
                            <th style={{textAlign:"left"}}><p>Active since:</p></th>
                            <td style={{textAlign:"right"}}><p>{jackpot.date}</p></td>
                            <th style={{textAlign:"left"}}><p>Currently monitored games:</p></th>
                            <td style={{textAlign:"right"}}><p>{this.props.monitored.length}</p></td>
                        </tr>
                        <tr>
                            <th style={{textAlign:"left"}}><p>Current share:</p></th>
                            <td style={{textAlign:"right"}}><p>{jackpot.share_timetable[jackpot.share_timetable.length-1][1]} $</p></td>
                            <th style={{textAlign:"left"}}><p>Invited players:</p></th>
                            <td style={{textAlign:"right"}}><p>{jackpot.recommendations.length}</p></td>
                        </tr>
                        <tr>
                            <th style={{textAlign:"left"}}><p>Last time your share was changed:</p></th>
                            <td style={{textAlign:"right"}}><p>{jackpot.share_timetable[jackpot.share_timetable.length-1][0]}</p></td>
                            <th style={{textAlign:"left"}}><p>Multipliers used:</p></th>
                            <td style={{textAlign:"right"}}><p>{jackpot.multipliers.length}</p></td>
                        </tr>
                    </table>
                </div>
            </div>
        )
    }
}

class J01PersonalGraph extends React.Component{
    render(){
        const xData = this.props.points.map(point => {
            return point[0];
        });
        const yData = this.props.points.map(point => {
            return point[1];
        });
        const data = {
            labels: xData,
            datasets: [
                {
                    label: this.props.title,
                    data: yData,
                    borderColor: "rgba(0,0,0,1)",
                    backgroundColor: "rgba(0,0,0,1)",
                    pointBorderColor: "rgba(0,0,0,1)",
                    pointBackgroundColor: "rgba(0,0,0,1)",
                    pointBorderWidth: 1,
                    fill: false
                }
            ]
        };
        const options = {
            responsive: true,
            legend:{
                display: false
            },
            title: {
                display: true,
                text: this.props.title
            },
            tooltips: {
                mode: 'label'
            },
            hover: {
                mode: 'dataset'
            },
            scales: {
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }
                ],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: this.props.yLabel
                        }
                    }
                ]
            }
        };
        return(
            <Line data={data} options={options} />
    )

    }
}

class J01PersonalTimeline extends React.Component{
    render(){
        let timeEvents = [[this.props.jackpot.date, 'a', 'arrival']];
        timeEvents = mergeEvents(timeEvents, this.props.monitored, this.props.jackpot.recommendations, this.props.jackpot.multipliers);
        timeEvents = mergeSort(timeEvents);
        const messages = timeEvents.map(event => {
            if(event[2] === 'arrival'){
                return <div><div>{event[0]}</div><div>Participation started</div></div>;
            }
            else if(event[2] === 'monitored'){
                return <div><div>{event[0]}</div><div>Permission given to monitor {event[1]} gameplay</div></div>;
            }
            else if(event[2] === 'recommendation'){
                return <div><div>{event[0]}</div><div>Invited {event[1]}</div></div>;
            }
            else{
                return <div><div>{event[0]}</div><div>Used a {event[1]} multiplier</div></div>;
            }
        });
        return(
            <div><div><h1>Timeline</h1></div><div>{messages}</div></div>
        )
    }
}

const mergeEvents = (timeEvents, monitored, recommendations, multipliers) => {
    const totalLength = monitored.length + recommendations.length + multipliers.length + 1;
    for(let game of monitored){
        timeEvents.push([game.register_date, game.name, 'monitored'])
    }
    for(let recommendation of recommendations){
        timeEvents.push([recommendation[0], recommendation[1], 'recommendation'])
    }
    for(let multiplier of multipliers){
        timeEvents.push([multiplier[0], multiplier[1], 'multiplier'])
    }
    return timeEvents;
};

const mergeSort = (unsortedArray) => {
    // No need to sort the array if the array only has one element or empty
    if (unsortedArray.length <= 1) {
        return unsortedArray;
    }

    // In order to divide the array in half, we need to figure out the middle
    const middle = Math.floor(unsortedArray.length / 2);

    // This is where we will be dividing the array into left and right
    const left = unsortedArray.slice(0, middle);
    const right = unsortedArray.slice(middle);

    // Using recursion to combine the left and right
    return merge(
        mergeSort(left), mergeSort(right)
    );
};

// Merge the two arrays: left and right
const merge = (left, right) => {
    let resultArray = [], leftIndex = 0, rightIndex = 0;

    // We will concatenate values into the resultArray in order
    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex][0] < right[rightIndex][0]) {
            resultArray.push(left[leftIndex]);
            leftIndex++; // move left array cursor
        } else {
            resultArray.push(right[rightIndex]);
            rightIndex++; // move right array cursor
        }
    }

    // We need to concat here because there will be one element remaining
    // from either left OR the right
    return resultArray
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex));
};


export default J01Personal;