import React from 'react';
import DescriptionBox from "../display_components/description-box";
import SimpleList from "../display_components/simple-list";

class BasicProfile extends React.PureComponent{
    render(){
        const user = this.props.user;
        const activeJackpots = user.jackpots.map(jackpot => {
            return [jackpot, `../../jackpots/${jackpot}`]
        });
        let strikeCount = 0;
        const strikesDisplay = user.strikes.map(strike => {
            strikeCount++;
            return <div>
            <span>{strike.strike_date.slice(0,10)}</span>
            <span>{` ${strike.strike_date.slice(11,19)}`}</span>
            <span>{` Strike ${strikeCount}`}</span>
            </div>
        });
        const availableMultipliers = createList(sortByClass(getClassArrayUser(user.multipliers)));
        return(
            <div>
                <section>
                    <DescriptionBox
                        thumbnail={user.thumbnail}
                        alt="Profile thumbnail"
                        title={user.name}
                        table = {[
                            [
                                ['Steamid', user.steamid],
                                ['Strikes', user.strikes.length],
                                ['Wealth', this.props.wealth + '$']
                            ],
                            [
                                ['Joined', user.joined],
                                ['Events played', user.jackpot_number],
                                ['Surveys answered', user.question_number]
                            ]
                        ]}
                    />
                </section>
                <section><div style={{textAlign: "center", verticalAlign: "text-top"}}>
                    <SimpleList
                        title="Available multipliers"
                        list={availableMultipliers}
                        useLinks={false}
                    />
                    <SimpleList
                        title="Current Events"
                        list={activeJackpots}
                        useLinks={true}
                    />
                    <SimpleList
                        title="Strikes"
                        list={strikesDisplay}
                        useLinks={false}
                    />
                </div></section>
            </div>
        )
    }
}

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
        return <div>
        <div style={{display: "inline-block", marginRight: "5px"}}>{multiplierClass}</div>
        <div style={{display: "inline-block"}}>x{multiplierClassCount[multiplierClass]}</div>
        </div>
    });
};

export default BasicProfile;