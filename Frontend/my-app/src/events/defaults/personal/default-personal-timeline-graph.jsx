//Standard
import React, {useContext} from "react";

//Local components
import AnnotatedChart from "../../../display-components/annotated-chart";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Useful functions
import configDefaultPersonalXAxes from "./default-personal-x-axes";
import configDefaultTooltips from "../../../chart-configuration/tooltips-default-config";

//Language jsons
import actionDict from "../../../language-display/action-classifier.json";

//Context
import LanguageContext from "../../../context/language-context";

//Main function
const DefaultPersonalTimelineGraph = ({date, share, timeline}) => {
    const language = useContext(LanguageContext);
    const [start, tomorrow, configXAxes] = configDefaultPersonalXAxes(date, language);
    return(
        <div>
            <div>
                <h2>{otherDict['event-personal']['timeline-graph-title'][language]}</h2>
            </div>
            <AnnotatedChart
                tooltips={configDefaultTooltips('$')}
                xAxes={configXAxes}
                tags = {
                    [
                        [
                            actionDict['MJ']['legend-tags']['ES'],
                            actionDict['MJ']['annotation-color']
                        ],
                        [
                            actionDict['SJ']['legend-tags']['ES'],
                            actionDict['SJ']['annotation-color']
                        ],
                        [
                            actionDict['DJ']['legend-tags']['ES'],
                            actionDict['DJ']['annotation-color']
                        ],
                        [
                            actionDict['PJ']['legend-tags']['ES'],
                            actionDict['PJ']['annotation-color']
                        ]
                    ]
                }
                title = "Your wealth's evolution"
                yLabel = {otherDict['chart']['y-label-money'][language]}
                start = {start}
                end = {tomorrow}
                points = {share}
                actions = {timeline}
            />
        </div>
    )
}
export default DefaultPersonalTimelineGraph;