//Standard
import React from "react";

//Local components
import DefaultGlobalInfoHeader from "./default-global-info-header";
import DefaultGlobalUserChart from "./default-global-user-chart";

//Main function
const WrappedDefaultGlobalUserChart = ({users, xAxes, language}) => {
    return (
        <div>
            <DefaultGlobalInfoHeader
                titleName="jackpot-user-chart-title"
                tooltipName="global-user-chart"
                language={language}
            />
            <DefaultGlobalUserChart
                users={users}
                xAxes={xAxes}
                language={language}
            />
        </div>
    )
}
export default WrappedDefaultGlobalUserChart;