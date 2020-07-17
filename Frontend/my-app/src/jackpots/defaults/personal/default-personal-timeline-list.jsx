//Standard
import React, {useContext} from "react";

//Local components
import TimeLine from "../../../display-components/timeline";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Context
import LanguageContext from "../../../language-context";

//Main function
const DefaultPersonalTimeLineList = ({timeline}) => {
    const language = useContext(LanguageContext);
    return(
        <div>
            <div>
                <h2>{otherDict['jackpot-personal']['timeline-list-title'][language]}</h2>
            </div>
            <TimeLine events={timeline} />
        </div>
    )
}
export default DefaultPersonalTimeLineList;