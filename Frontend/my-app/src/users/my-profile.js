import React from "react";
import BasicProfile from "./basic-profile";
import TimeLine from "../display_components/timeline";
import Math from "math";
import mergeEvents from "../useful_functions/event-sort";
import AnnotatedChart from "../display_components/annotatedchart";

class MyProfile extends React.Component{
    constructor(){
        super();
        this.state = {
            isLoaded: false,
            user: null,
            error: false,
            activeJackpots: null,
            currentStrikes: null,
            availableMultipliers: null,
            showTransactions: false
        }
    }
    componentDidMount(){
        fetch('/users/profiles/my_profile')
            .then(res => res.json())
            .then(res => {
                this.setState({
                    isLoaded: true,
                    user: res,
                    showTransactions: res.transactions.length>2
                });
            })
            .catch(err => {this.setState({error: true, isLoaded: true})})
    }
    render(){
        if(this.state.isLoaded === false){
            return <div>Loading profile...</div>
        }
        else if(this.state.error === true){
            return <div>To access your profile you must authenticate through steam</div>
        }
        else if(this.state.showTransactions === false){
            return (<BasicProfile user={this.state.user} />)
        }
        else if(this.state.showTransactions === true){
            const transactionItems = {
                reward: [],
                donation: [],
                present: [],
                fund: []
            };
            for(let transaction of this.state.user.transactions){
                transactionItems[transaction.transaction_type].push(transaction)
            }
            const timeTransactions = mergeEvents([], transactionItems);
            return (
                <div>
                    <BasicProfile user={this.state.user} />
                    <AnnotatedChart
                        points={this.state.user.wealth_timetable}
                        title="Your share ($)"
                        yLabel="Share ($)"
                        events={timeTransactions}
                        tags={['reward','donation','present','fund']}
                    />
                </div>
            )
        }
        else{
            return(<div>Internal server error</div>)
        }
    }
}

export default MyProfile;