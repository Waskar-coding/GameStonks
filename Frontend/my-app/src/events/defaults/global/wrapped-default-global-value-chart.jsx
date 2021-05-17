//Standard
import React from "react";

//Local components
import DefaultGlobalInfoHeader from "./default-global-info-header";
import DefaultGlobalValueChart from "./default-global-value-chart";

//Main function
const WrappedDefaultGlobalValueChart = ({price, xAxes, language}) => {
    return (
        <div>
            <DefaultGlobalInfoHeader
                titleName="event-value-chart-title"
                tooltipName="global-value-chart"
                language={language}
            />
            <DefaultGlobalValueChart
                price={price}
                xAxes={xAxes}
                language={language}
            />
        </div>
    )
}
export default WrappedDefaultGlobalValueChart;