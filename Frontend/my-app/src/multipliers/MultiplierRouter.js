import React from "react";
import { Suspense } from "react";
import axios from "axios";

class MultiplierRouter extends React.Component{
    constructor(props){
        super(props);
        const currentConstructor = (props.userMultipliers.length === 0)? null : props.userMultipliers[0].split('_')[0];
        this.state = {
            isLoaded: false,
            current: currentConstructor,
            userMultipliers: props.userMultipliers,
            jackpotMultipliers: props.jackpotMultipliers,
            currentMultiplierId: null,
            currentMultiplierScript: null
        };
        this.handleCurrentChange = this.handleCurrentChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCallback = this.handleCallback.bind(this);
    }
    componentDidMount() {
        this.setState({
            isLoaded: true
        })
    }
    handleCurrentChange(event){
        this.setState({
            current: event.target.value
        });
    }
    handleSubmit(event){
        event.preventDefault();
        const multiplierId = popMultiplier(this.state.userMultipliers, this.state.current);
        const CurrentMultiplier = React.lazy(() => import(`./${this.state.current}`));
        this.setState({
            currentMultiplierId: multiplierId,
            currentMultiplierScript: CurrentMultiplier
        })
    }
    handleCallback(user){
        this.props.toParent(user);
        const currentJackpot = user.jackpots.filter(jackpot => {return jackpot.jackpot_id === this.props.jackpotId}).pop()
        this.setState({userMultipliers: user.multipliers, jackpotMultipliers: currentJackpot.multipliers})
    }
    render(){
        let renderContent;
        if(this.state.isLoaded === false){
            renderContent = <div></div>
        }
        else if(this.state.userMultipliers.length === 0){
            const availableMultipliers = sortByClass(getClassArrayUser(this.state.userMultipliers));
            const usedMultipliers = sortByClass(getClassArrayJackpot(this.state.jackpotMultipliers));
            const CurrentMultiplier = this.state.currentMultiplierScript;
            renderContent = <div>
                    <div>
                        <h2>Available Multipliers</h2>
                        <p>None currently</p>
                    </div>
                    <div>
                        <h2>Used multipliers</h2>
                        <MultiplierList multipliers={usedMultipliers} />
                    </div>
                </div>
        }
        else{
            const availableMultipliers = sortByClass(getClassArrayUser(this.state.userMultipliers));
            const usedMultipliers = sortByClass(getClassArrayJackpot(this.state.jackpotMultipliers));
            const CurrentMultiplier = this.state.currentMultiplierScript;
            const multiplierStatus = <div>
                                <form onSubmit={this.handleSubmit}>
                                    <label for="currentMultiplier">Select a Multiplier </label>
                                    <select id="currentMultiplier" value={this.state.current} onChange={this.handleCurrentChange}>
                                        {Object.keys(availableMultipliers).map(multiplier => {
                                            return <option value={multiplier}>{multiplier}</option>
                                        })}
                                    </select>
                                    <input type="submit" value="Submit" />
                                </form>
                                <div>
                                    <h2>Available Multipliers</h2>
                                    <MultiplierList multipliers={availableMultipliers} />
                                </div>
                                <div>
                                    <h2>Used multipliers</h2>
                                    <MultiplierList multipliers={usedMultipliers} />
                                </div>
                            </div>
            if(this.state.currentMultiplierScript !== null){
                const multiplierPopUp = <Suspense fallback={<div>Loading...</div>}><CurrentMultiplier multiplierClass={this.state.current} multiplierId = {this.state.currentMultiplierId} toParent={this.handleCallback}/></Suspense>
                renderContent = <div>{multiplierStatus}{multiplierPopUp}</div>;
            }
            else{ renderContent = <div>{multiplierStatus}</div>}
        }
        return(<div>{renderContent}</div>)

    }
}

class MultiplierList extends React.PureComponent{
    render(){
        const multiplierList = Object.keys(this.props.multipliers).map(multiplier => {
            return <div><span>x{this.props.multipliers[multiplier]} </span>{multiplier}<span></span></div>
        });
        return(
            <div>
                {multiplierList}
            </div>
        )
    }
}
const getClassArrayJackpot = (multipliers) => {
    return (multipliers.length !== 0)? multipliers.map(multiplier => {return multiplier[1]}): multipliers
};
const getClassArrayUser = (multipliers) => {
    return (multipliers.length !== 0) ? multipliers.map(multiplier => {return multiplier.split('_')[0]}) : multipliers
};
const sortByClass = (multipliers) => {
    const multiplierClassCount = {};
    for(let multiplier of multipliers){
        console.log(multiplier);
        if(Object.keys(multiplierClassCount).includes(multiplier)){
            multiplierClassCount[multiplier.split('_')[0]]++;
        }
        else{
            multiplierClassCount[multiplier.split('_')[0]] = 1;
        }
    }
    return multiplierClassCount;
};
const popMultiplier = (multiplierList, multiplierClass) => {
    for(let multiplier of multiplierList){
        if(multiplier.split('_')[0] === multiplierClass){
            return multiplier;
        }
    }
};


export default MultiplierRouter;