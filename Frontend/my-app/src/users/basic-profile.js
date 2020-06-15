import React from 'react';
import DescriptionBox from "../display_components/descriptionbox";
import SimpleList from "../display_components/simplelist";

class BasicProfile extends React.PureComponent{
    render(){
        let strikeCount = 0;
        const user = this.props.user;
        let lastBanDate = new Date("2020-01-01");
        for(let ban of user.bans){
            if(new Date(ban.ban_end) >= lastBanDate){
                lastBanDate = ban.ban_end;
            }
        }
        const activeJackpots = user.jackpots.filter(jackpot => {
            return jackpot.status === 'a';
        })
            .map(
                jackpot => {return [jackpot.jackpot_id, `../../jackpots/${jackpot.jackpot_id}`]}
            );
        const currentStrikes = user.strikes.filter(strike => {return strike.strike_date >= lastBanDate})
            .map(filteredStrike => {
                strikeCount++;
                return <div>
                <span>{filteredStrike.strike_date.slice(0,10)}</span>
                <span>{` ${filteredStrike.strike_date.slice(11,19)}`}</span>
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
                                ['Joined', user.joined],
                                ['Wealth', user.wealth_timetable[user.wealth_timetable.length-1]]
                            ],
                            [
                                ['Strikes', user.current_strikes],
                                ['Events played', user.jackpots.length],
                                ['Surveys answered', user.questions.length]
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
                        list={currentStrikes}
                        useLinks={false}
                    />
                </div></section>
                <section><div>
                    <a
                        target="_blank"
                        href={user.profile_url}
                        title="Check steam profile"
                    >
                        <img
                            width='50'
                            src="https://w7.pngwing.com/pngs/407/234/png-transparent-steam-mervils-a-vr-adventure-computer-icons-personal-computer-valve-corporation-steam-engine-game-logo-windows.png"
                            alt='Steam_logo_small'
                        />
                    </a>
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