//Standard
import React, {useContext} from "react";

//Packages
import {Line} from "react-chartjs-2";

//Local components
import AnnotatedChart from "../../display-components/annotated-chart";
import DefaultError from "../../error-components/default-error";
import DisabledChart from "../../display-components/disabled-chart";

//Useful functions
import configMoneyDisplay from "../../data-manipulation/config-money-display";
import configDefaultTooltips from "../../chart-configuration/tooltips-default-config";
import configDefaultXAxes from "../../chart-configuration/xaxes-default-config";

//Language jsons
import actionDict from "../../language-display/action-classifier.json";
import otherDict from "../../language-display/other-classifier.json";
import messageDict from "../../language-display/message-classifier.json";

//Context
import LanguageContext from "../../context/language-context";

//Main function
const UserTimelineGraph = ({graphData}) => {
    const {startDate, finalDate, timeline, points, apiStatus} = graphData;
    const newPoints = points.map(point => {return {x: point['x'], y: configMoneyDisplay(point['y'])}});
    const language = useContext(LanguageContext);
    switch(apiStatus){
        case 0:
            const options = {
                responsive: true, legend:{display: false},
                scales: {xAxes: [configDefaultXAxes(new Date(startDate),new Date(finalDate),language)]}
            }
            return(
                <DisabledChart disabledMessage={messageDict['loading']['graph-timeline'][language]}>
                    <Line data={{x: 0, y: 0}} options={options} />
                </DisabledChart>
            )
        case 200:
            return(
                <AnnotatedChart
                    tooltips={configDefaultTooltips('$')}
                    xAxes={configDefaultXAxes(new Date(startDate),new Date(finalDate),language)}
                    tags = {['M','S','D','G','R','U','E','T'].map(tag =>
                        [actionDict[tag]['legend-tags'][language],actionDict[tag]['annotation-color']]
                    )}
                    title = "Your wealth's evolution" yLabel = {otherDict['chart']['y-label-money'][language]}
                    start = {new Date(startDate)} end = {new Date(finalDate)} points = {newPoints} actions = {timeline}
                />
            )
        default: return(<DefaultError apiStatus={apiStatus} errorDict={{500: "graph-timeline-500"}} />)
    }
}
export default React.memo(UserTimelineGraph);