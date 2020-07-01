//Standard
import React from 'react';

//Packages
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import {CopyToClipboard} from 'react-copy-to-clipboard';

//Useful functions
import getLocalDate from "../useful_functions/date-offset";
import processEvent from "../useful_functions/process-event";
import sortMultipliers from "../useful_functions/sort-multiplier";

//Local components
import DescriptionBox from "../display_components/description-box";
import SimpleList from "../display_components/simple-list";

//Language jsons
import otherDict from "../language-display/other-classifier";
import interactiveDict from "../language-display/interactive-classifier";

//Context
import LanguageContext from "../language-context";


class BasicProfile extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            copied: false
        }
    }
    render(){
        const user = this.props.user;
        const activeJackpots = user.jackpots.map(jackpot => {
            return (
                [
                    <Tippy
                        content={
                            `${interactiveDict['profile-tooltips']['event-link'][this.context]} ${jackpot}`
                        }
                    >
                        <div>{jackpot}</div>
                    </Tippy>,
                    `../../jackpots/${jackpot}`
                ]
            )
        });
        let strikeCount = 0;
        const strikesDisplay = user.strikes.map(strike => {
            strikeCount++;
            return(
                <Tippy
                    content={processEvent(
                        this.context,
                        this.props.person,
                        [strike.strike_date,'S',strike.strike_type].concat(strike.strike_data)
                        )[3]
                    }
                >
                    <div>
                        <span>{getLocalDate(new Date(strike.strike_date)).toISOString().slice(0,10)}</span>
                        <span>{` Strike ${strikeCount}`}</span>
                    </div>
                </Tippy>
            )
        });
        const availableMultipliers = sortMultipliers(user.multipliers, this.context);
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
                                [
                                    otherDict['profile']['events-total'][this.context],
                                    user.jackpot_number
                                ]
                            ],
                            [
                                [
                                    otherDict['profile']['joined'][this.context],
                                    getLocalDate(new Date(user.joined)).toISOString().slice(0,10)
                                ],
                                [
                                    otherDict['profile']['wealth'][this.context],
                                    this.props.wealth + '$'
                                ],
                                [
                                    otherDict['profile']['surveys'][this.context],
                                    user.question_number
                                ]
                            ]
                        ]}
                    />
                </section>
                <section>
                    {this.state.copied ? (
                            <CopyToClipboard text={user.steamid}>
                                <Tippy
                                    content={interactiveDict['profile-tooltips']['copy-steamid'][this.context]}
                                    hideOnClick={false}
                                >
                                    <button
                                        onClick={() => {this.setState({copied: true});}}
                                        onMouseLeave={() => {this.setState({copied: false})}}
                                    >
                                        {interactiveDict['copy-steamid'][this.context]}
                                    </button>
                                </Tippy>
                            </CopyToClipboard>
                        ) : (
                            <CopyToClipboard text={user.steamid}>
                                <button
                                    onClick={() => {this.setState({copied: true})}}
                                    onMouseLeave={() => {this.setState({copied: false})}}
                                >
                                    {interactiveDict['copy-steamid'][this.context]}
                                </button>
                            </CopyToClipboard>
                    )}

                    <a href={user.profile_url} target="_blank" rel="noopener noreferrer">
                        {interactiveDict['profile-tooltips']['steam-link'][this.context][this.props.person]}
                    </a>
                </section>
                <section>
                    <div style={{textAlign: "center", verticalAlign: "text-top"}}>
                        <SimpleList
                            title={otherDict['profile']['multiplier'][this.context]}
                            list={availableMultipliers}
                            useLinks={true}
                            target="_blank"
                            />
                        <SimpleList
                            title={otherDict['profile']['events-active'][this.context]}
                            list={activeJackpots}
                            useLinks={true}
                            target="_self"
                        />
                        <SimpleList
                            title="Strikes"
                            list={strikesDisplay}
                            useLinks={false}
                            target={null}
                        />
                    </div>
                </section>
            </div>
        )
    }
}

BasicProfile.contextType = LanguageContext;


export default BasicProfile;