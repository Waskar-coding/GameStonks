//Standard
import React from "react";

//Packages
import Tippy from "@tippy.js/react";

//Language jsons
import interactiveDict from "../../../language-display/interactive-classifier.json";
import otherDict from "../../../language-display/other-classifier.json";

//Main function
const DefaultGlobalInfoHeader = ({titleName, tooltipName, language}) => {
    return(
        <div>
            <h2>{otherDict['event'][titleName][language]}</h2>
            <div>
                <Tippy content={interactiveDict['event-tooltips'][tooltipName][language]}>
                    <div>Info</div>
                </Tippy>
            </div>
        </div>
    )
}
export default DefaultGlobalInfoHeader;