//Standard
import {useContext, useMemo, useState} from "react";

//Useful functions
import processAction from "../../language-display/process-action";

//Context
import LanguageContext from "../../context/language-context";

export default (state, person) => {
    /*
    Uses state and person, to return a basic profile config used in both user-profile and my-profile
    */
    const language = useContext(LanguageContext);
    const TIMELINE_KEYS = ['startDate', 'finalDate', 'timeline'];
    const { initProfile, initList } = Object.entries(state).reduce(
        (currentObject,[key, value]) => {
            if(TIMELINE_KEYS.includes(key)){currentObject.initList[key] = value}
            else currentObject.initProfile[key] = value;
            return currentObject
        },
        {initProfile: {}, initList: {apiStatus: 200}}
    )
    const [ profile, setProfile ] = useState(initProfile);
    const [ list, setList ] = useState(initList);
    const processedListTimeLine = useMemo(() =>
        list.timeline.slice().reverse().map(action => processAction(language, person, action))
    ,[list.timeline, language, person]);
    return {
        profile: profile, setProfile: setProfile,
        list: list, setList: setList,
        processedListTimeLine: processedListTimeLine
    }
}
