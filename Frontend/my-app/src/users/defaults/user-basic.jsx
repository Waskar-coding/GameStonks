//Standard
import React, {useContext, useState} from 'react';

//Packages
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import {CopyToClipboard} from 'react-copy-to-clipboard';

//Useful functions
import configMoneyDisplay from "../../data-manipulation/config-money-display";
import getLocalDate from "../../data-manipulation/date-offset";
import processAction from "../../language-display/process-action";
import sortMultipliers from "../../multipliers/multiplier-sort";

//Local components
import DescriptionBox from "../../display-components/description-box";
import SimpleList from "../../display-components/simple-list";

//Language jsons
import otherDict from "../../language-display/other-classifier.json";
import interactiveDict from "../../language-display/interactive-classifier.json";

//Context
import LanguageContext from "../../context/language-context";
import ProfileContext from "../../context/profile-context";

//Wrapped Main function
const WrappedDefaultProfile = ({profileState, profileSetter, person, initialState}) => {
    return(
        <ProfileContext.Provider value={{profile:profileState, setProfile: profileSetter}}>
            <InnerDefaultProfile person={person} state={initialState} />
        </ProfileContext.Provider>
    )
}
export default React.memo(WrappedDefaultProfile);

//Inner Main function
const InnerDefaultProfile = ({person, state}) => {
    const language = useContext(LanguageContext);
    let strikeCount = 0;
    const strikeDisplay = state.strikes.map(strike => {
        strikeCount++;
        return(
            <Tippy
                content={processAction(
                    language, person, [strike.strike_date,'S',strike.strike_type].concat(strike.strike_data)
                )[3]}
            >
                <div>
                    <span>{getLocalDate(new Date(strike.strike_date)).toISOString().slice(0,10)}</span>
                    <span>{` Strike ${strikeCount}`}</span>
                </div>
            </Tippy>
        ) 
    });
    return(
        <div>
            <section>
                <DescriptionBox
                    thumbnail={state.thumbnail} alt="Profile thumbnail" title={state.name}
                    table = {[
                        [
                            ['SteamId', state.steamId], ['Strikes', state.strikes.length],
                            [otherDict['profile']['events-total'][language], <SimpleProfileConsumer field="eventNumber" />]
                        ],
                        [
                            [
                                otherDict['profile']['joined'][language],
                                getLocalDate(new Date(state.joined)).toISOString().slice(0,10)
                            ],
                            [otherDict['profile']['wealth'][language], <SimpleProfileConsumer field="wealth" />],
                            [otherDict['profile']['surveys'][language], state.questionNumber]
                        ]
                    ]}
                />
            </section>
            <section>
                <CopySteamId steamId={state.steamId} language={language} />
                <a href={state.profileUrl} target="_blank" rel="noopener noreferrer">
                    {interactiveDict['profile-tooltips']['steam-link'][language][person]}
                </a>
            </section>
            <section>
                <div style={{textAlign: "center", verticalAlign: "text-top"}}>
                    <MultiplierProfileConsumer language={language} />
                    <EventProfileConsumer language={language}/>
                    <SimpleList title="Strikes" list={strikeDisplay} useLinks={false} target={null} />
                </div>
            </section>
        </div>
    )
}

const CopySteamId = ({steamId,language}) => {
    const [copied, setCopied] = useState(false);
    return(
        <CopyToClipboard text={steamId}>
            {(copied)? (
                <Tippy content={interactiveDict['profile-tooltips']['copy-steamid'][language]} hideOnClick={false}>
                    <button onClick={() => {setCopied(true)}} onMouseLeave={() => {setCopied(false)}}>
                        {interactiveDict['copy-steamid'][language]}
                    </button>
                </Tippy>
            ) : (
                <button onClick={() => {setCopied(true)}} onMouseLeave={() => {setCopied(false)}}>
                    {interactiveDict['copy-steamid'][language]}
                </button>
            )}
        </CopyToClipboard>
    )
}

const SimpleProfileConsumer = ({field}) => {
    const {profile} = useContext(ProfileContext);
    const value = profile[field];
    return(<React.Fragment>{field === "wealth"? (`${configMoneyDisplay(value)}$`) : (value)}</React.Fragment>)
}

const MultiplierProfileConsumer = ({language}) => {
    const {profile} = useContext(ProfileContext);
    return(
        <SimpleList
            title={otherDict['profile']['multiplier'][language]}
            list={sortMultipliers(profile.multipliers, true, language)}
            useLinks={true} target="_blank"
        />
    )
}

const EventProfileConsumer = ({language}) => {
    const {profile} = useContext(ProfileContext);
    return(
        <SimpleList
            title={otherDict['profile']['events-active'][language]} useLinks={true} target="_self"
            list={profile.events.map(event => { return ([
                <Tippy content={`${interactiveDict['profile-tooltips']['event-link'][language]} ${event}`}>
                    <div>{event}</div>
                </Tippy>,
                `../../events/${event}`
            ])})}
        />
    )
}