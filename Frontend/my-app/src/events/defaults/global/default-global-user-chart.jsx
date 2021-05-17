//Standard
import React from "react";

//Local components
import SimpleChart from "../../../display-components/simple-chart";

//Useful functions
import configDefaultTooltips from "../../../chart-configuration/tooltips-default-config";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Main function
const DefaultGlobalUserChart = ({users, xAxes, language}) => {
    return (
        <SimpleChart
            title="Active users"
            points={users}
            yLabel={otherDict['chart']['y-label-users'][language]}
            xAxes={xAxes}
            tooltips={configDefaultTooltips(' users')}
        />
    )
}
export default DefaultGlobalUserChart;