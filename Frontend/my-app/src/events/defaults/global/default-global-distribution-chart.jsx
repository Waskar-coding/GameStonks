//Standard
import React from "react";

//Local components
import BarChart from "../../../display-components/bar-chart";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Main function
const DefaultGlobalDistributionChart = ({score, language}) => {
    return(
        <BarChart
            points={score}
            title="Wealth distribution"
            labels={[
                otherDict['bars']['lowest'][language],
                '', '','', '','','','',
                otherDict['bars']['highest'][language]
            ]}
            yLabel={otherDict['bars']['y-label-wealth-percent'][language]}
        />
    )
}
export default DefaultGlobalDistributionChart;