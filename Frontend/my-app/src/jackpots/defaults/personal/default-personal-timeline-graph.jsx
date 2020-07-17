//Standard
import React, {useContext} from "react";

//Local components
import AnnotatedChart from "../../../display-components/annotated-chart";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Useful functions
import configDefaultPersonalXAxes from "./default-personal-x-axes";
import configDefaultTooltips from "../../../useful-functions/tooltips-default-config";

//Language jsons
import eventDict from "../../../language-display/timeline-classifier.json";

//Context
import LanguageContext from "../../../language-context";

//Main function
const DefaultPersonalTimelineGraph = ({date, share , timeline}) => {
    const language = useContext(LanguageContext);
    const [start, tomorrow, configXAxes] = configDefaultPersonalXAxes(date, language);
    return(
        <div>
            <div>
                <h2>{otherDict['jackpot-personal']['timeline-graph-title'][language]}</h2>
            </div>
            <AnnotatedChart
                tooltips={configDefaultTooltips('$')}
                xAxes={configXAxes}
                tags = {
                    [
                        [
                            eventDict['MJ']['legend-tags']['ES'],
                            eventDict['MJ']['annotation-color']
                        ],
                        [
                            eventDict['SJ']['legend-tags']['ES'],
                            eventDict['SJ']['annotation-color']
                        ],
                        [
                            eventDict['DJ']['legend-tags']['ES'],
                            eventDict['DJ']['annotation-color']
                        ],
                        [
                            eventDict['PJ']['legend-tags']['ES'],
                            eventDict['PJ']['annotation-color']
                        ]
                    ]
                }
                title = "Your wealth's evolution"
                yLabel = {otherDict['chart']['y-label-money'][language]}
                start = {start}
                end = {tomorrow}
                points = {share}
                events = {timeline}
            />
        </div>
    )
}
export default DefaultPersonalTimelineGraph;