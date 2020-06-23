import React from "react";
import SimpleList from "../../display_components/simple-list";
import AnnotatedChart from "../../display_components/annotated-chart";
import TimeLine from "../../display_components/timeline";
import MultiplierRouter from "../../multipliers/MultiplierRouter";
import DescriptionBox from "../../display_components/description-box";
import mergeEvents from "../../useful_functions/event-sort";
import axios from "axios";

class J01Personal extends React.Component{
    constructor(){
        super();
        this.state = {
            isLoaded: false,
            isError: false,
            isAuth: false,
            jackpotIndex: null,
            user: null,
            recommendations: []
        };
        this.handleMultiplierCallback = this.handleMultiplierCallback.bind(this);
        this.retrieveHandshakes = this.retrieveHandshakes.bind(this);
    }
    componentDidMount(){
        fetch(`../../users/profiles/my_profile`)
            .then(res => res.json())
            .then(
                (res) => {
                    if(res.jackpots){
                        this.setState({
                            isAuth: true,
                            user: res,
                        });
                        for(let i=0; i<res.jackpots.length; i++){
                            if(res.jackpots[i].jackpot_id === this.props.jackpotId){
                                let recommendations = res.jackpots[i].recommendations.map(recommendation => {
                                    return recommendation[1]
                                });
                                if(recommendations.length === 0){
                                    this.setState({
                                        jackpotIndex: i,
                                        isLoaded: true,
                                        recList: ['You have not received any handshake']
                                    });
                                }
                                else{
                                    this.retrieveHandshakes(recommendations,i)
                                }
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
    retrieveHandshakes(recommendations,jackpotIndex){
        axios.post('/users/handshakes', {recommendations: recommendations})
            .then(res => {
                const recommendationList = res.data.recommendations.map(user => {
                    return <div>
                                <a href={`../../../users/profiles/${user.name}`}>
                                    <div><img src={user.thumbnail} alt={user.name} width="30"/></div>
                                    <div>{user.name}</div>
                                </a>
                            </div>
                });
                this.setState({
                    isLoaded: true,
                    recList: recommendationList,
                    jackpotIndex: jackpotIndex
                })
            })
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
        if(isLoaded === false){
            return(<div>Loading...</div>)
        }
        else if(isError === true){
            return(<div>This jackpot requires Steam authentication, please authenticate through Steam to participate. If you where already authenticated an internal server error may have ocurred your personal and stats could not be loaded, if so, we are already working to provide a solution.</div>)
        }
        else if(isUser === false){
            return(<div>You are not currently participating in the jackpot</div>);
        }
        else{
            if(this.state.user.jackpots[this.state.jackpotIndex].status === 'a'){
                const jackpot = this.state.user.jackpots[this.state.jackpotIndex];
                const jackpotMonitored = this.state.user.monitored.filter(game => {
                    return game.register_date >= jackpot.date;
                });
                const eventItems = {
                  monitored: jackpotMonitored,
                  recommendation: jackpot.recommendations,
                  multiplier: jackpot.multipliers
                };
                const timeEvents = mergeEvents(
                    [[jackpot.date, `You entered the event`, 'arrival']],
                    eventItems
                );
                return(
                    <div>
                        <DescriptionBox
                            thumbnail={this.state.user.thumbnail}
                            alt='User thumbnail'
                            title={this.state.user.name}
                            table={[
                                [["Active since",jackpot.date.slice(0,10)],["Monitored",this.state.user.monitored.length]],
                                [["Share","99.64 $"],["Invited",jackpot.recommendations.length]],
                                [["Updated","2020-05-17"],["Multipliers",jackpot.multipliers.length]]
                            ]}
                        />
                        <MultiplierRouter
                            jackpotId={jackpot.jackpot_id}
                            userMultipliers={this.state.user.multipliers}
                            jackpotMultipliers={jackpot.multipliers}
                            toParent={this.handleMultiplierCallback}
                        />
                        <SimpleList
                            title="Handshakes"
                            list={this.state.recList}
                            useLinks={false}
                        />
                        <AnnotatedChart
                            points={jackpot.share_timetable}
                            title="Your share ($)"
                            yLabel="Share ($)"
                            events={timeEvents}
                            tags={['arrival','monitored','recommendation','multiplier']}
                        />
                        <TimeLine
                            title="Your event timeline"
                            events = {timeEvents}
                        />
                    </div>
                )
            }
            else{
                return(<div>You where kicked from this jackpot</div>)
            }
        }
    }
}
export default J01Personal;