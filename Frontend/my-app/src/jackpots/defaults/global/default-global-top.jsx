//Standard
import React from "react";
import messageDict from "../../../language-display/message-classifier.json";
import GlobalTop from "../../../display-components/global-top";

//Main function
const DefaultGlobalTop = ({top, language}) => {
    return (
        <GlobalTop
            players={top}
            incompleteMessage={messageDict['jackpot-stats']['global-top']['incomplete'][language]}
            completeLength={10}
        />
    )
}
export default DefaultGlobalTop;