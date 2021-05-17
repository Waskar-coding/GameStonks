//Standard
import React from "react";
import otherDict from "../../../language-display/other-classifier.json";
import GlobalTop from "../../../display-components/global-top";
import messageDict from "../../../language-display/message-classifier.json";
import DefaultGlobalInfoHeader from "./default-global-info-header";

//Main function
const WrappedDefaultGlobalTop = ({top, language}) => {
    return (
        <div>
            <DefaultGlobalInfoHeader
                titleName="event-top-title"
                tooltipName="global-user-top"
                language={language}
            />
            {(top.length === 0)? (
                <div>{otherDict['bars']['y-label-wealth-percent'][language]}</div>
            ):(
                <GlobalTop
                    players={top}
                    incompleteMessage={messageDict['event-stats']['global-top']['incomplete'][language]}
                    completeLength={10}
                />
            )}
        </div>
    )
}
export default WrappedDefaultGlobalTop;