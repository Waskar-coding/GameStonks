import React from "react";
import { Suspense } from "react";
import axios from "axios";
import SimpleList from "../display_components/simplelist";

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
        if(this.state.isLoaded === false){
            return(<div></div>)
        }
        else if(this.state.userMultipliers.length === 0){
            const availableMultipliers = sortByClass(getClassArrayUser(this.state.userMultipliers));
            const usedMultipliers = createList(sortByClass(getClassArrayJackpot(this.state.jackpotMultipliers)));
            const CurrentMultiplier = this.state.currentMultiplierScript;
            return(
                <div>
                    <div>
                        <SimpleList
                            title="Available multipliers"
                            list={['None currently ...']}
                            useLinks={false}
                        />
                    </div>
                    <div>
                        <SimpleList
                            title="Used multipliers"
                            list={usedMultipliers}
                            useLinks={false}
                        />
                    </div>
                </div>
            )
        }
        else{
            const multiplierCount = sortByClass(getClassArrayUser(this.state.userMultipliers));
            const availableMultipliers = createList(multiplierCount);
            const usedMultipliers = createList(sortByClass(getClassArrayJackpot(this.state.jackpotMultipliers)));
            const CurrentMultiplier = this.state.currentMultiplierScript;
            const multiplierStatus = <div>
                                <form onSubmit={this.handleSubmit}>
                                    <label for="currentMultiplier">Select a Multiplier </label>
                                    <select id="currentMultiplier" value={this.state.current} onChange={this.handleCurrentChange}>
                                        {Object.keys(multiplierCount).map(multiplier => {
                                            return <option value={multiplier}>{multiplier}</option>
                                        })}
                                    </select>
                                    <input type="submit" value="Submit" />
                                </form>
                                <div>
                                    <SimpleList
                                        title="Available multipliers"
                                        list={availableMultipliers}
                                        useLinks={false}
                                    />
                                </div>
                                <div>
                                    <SimpleList
                                        title="Used multipliers"
                                        list={usedMultipliers}
                                        useLinks={false}
                                    />
                                </div>
                            </div>
            if(this.state.currentMultiplierScript !== null){
                const multiplierPopUp = <Suspense fallback={<div>Loading...</div>}><CurrentMultiplier multiplierClass={this.state.current} multiplierId = {this.state.currentMultiplierId} toParent={this.handleCallback}/></Suspense>
                return(<div>{multiplierStatus}{multiplierPopUp}</div>)
            }
            else{ return(<div>{multiplierStatus}</div>)}
        }

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
        if(Object.keys(multiplierClassCount).includes(multiplier)){
            multiplierClassCount[multiplier.split('_')[0]]++;
        }
        else{
            multiplierClassCount[multiplier.split('_')[0]] = 1;
        }
    }
    return multiplierClassCount;
};
const createList = (multiplierClassCount) => {
    return Object.keys(multiplierClassCount).map(multiplierClass => {
        return <div><div>{multiplierClass}</div><div>x{multiplierClassCount[multiplierClass]}</div></div>
    });
};
const popMultiplier = (multiplierList, multiplierClass) => {
    for(let multiplier of multiplierList){
        if(multiplier.split('_')[0] === multiplierClass){
            return multiplier;
        }
    }
};


export default MultiplierRouter;