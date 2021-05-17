//Standard
import React from "react";

//Local components
import SimpleChart from "../../../display-components/simple-chart";

//Useful functions
import configDefaultTooltips from "../../../chart-configuration/tooltips-default-config";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Main function
const DefaultGlobalValueChart = ({price, xAxes, language}) => {
    return (
        <SimpleChart
            title="Event value"
            points={price}
            yLabel={otherDict['chart']['y-label-money'][language]}
            xAxes={xAxes}
            tooltips={configDefaultTooltips('$')}
        />
    )
}
export default DefaultGlobalValueChart;