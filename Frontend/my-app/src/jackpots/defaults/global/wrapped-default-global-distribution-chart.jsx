//Standard
import React from "react";

//Local components
import DefaultGlobalDistributionChart from "./default-global-distribution-chart";
import DefaultGlobalInfoHeader from "./default-global-info-header";
import DisabledChart from "../../../display-components/disabled-chart";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Main function
const WrappedDefaultGlobalDistributionChart = ({score, language}) => {
    return (
        <div>
            <DefaultGlobalInfoHeader 
                titleName="jackpot-user-chart-title"
                tooltipName="global-value-dist"
                language={language}
            />
            {(score.length === 0)? (
                <DisabledChart
                    disabledMessage={otherDict['bars']['not-found'][language]}
                >
                    <DefaultGlobalDistributionChart score={score} language={language} />
                </DisabledChart>
            ) : (
                <DefaultGlobalDistributionChart score={score}  language={language} />
            )}
        </div>
    )
}
export default WrappedDefaultGlobalDistributionChart;