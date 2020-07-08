//Standard
import React from "react";

//Packages
import { Line } from "react-chartjs-2";
import 'chartjs-plugin-annotation';

//Context
import LanguageContext from "../language-context";

class AnnotatedChart extends React.PureComponent{
    render(){
        const events = this.props.events;
        const annotations = events.map(event => {
            return {
                type: 'line',
                id: `${event[0]}_${event[1]}`,
                mode: 'vertical',
                scaleID: 'x-axis-0',
                value: new Date(event[0]).getTime(),
                borderColor: event[2],
                borderWidth: 2
            }
        });
        const data = {
            datasets: [
                {
                    label: this.props.title,
                    data: this.props.points,
                    borderColor: "rgba(0,0,0,1)",
                    backgroundColor: "rgba(0,0,0,1)",
                    pointBorderColor: "rgba(0,0,0,1)",
                    pointBackgroundColor: "rgba(0,0,0,1)",
                    pointBorderWidth: 1,
                    fill: false
                }
            ]
        };
        const options = {
            responsive: true,
            legend:{
                display: false
            },
            tooltips: this.props.tooltips,
            hover: {
                mode: 'dataset'
            },
            scales: {
                xAxes: [this.props.xAxes],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: this.props.yLabel
                        }
                    }
                ]
            },
            annotation: {
                drawTime: 'afterDatasetsDraw',
                annotations: annotations
            }
        };
        return(
            <div>
                <Line data={data} options={options} />
                <div style={{textAlign: "center"}}>
                    <ul style={{listStyleType:"none"}}>
                        {this.props.tags.map(tag => {
                            return(
                                <li key={tag[0]}>
                                    <div style={{display: "inline-block", margin: "8px"}}>
                                        <div
                                            style={{
                                                display: "inline-block",
                                                    backgroundColor: tag[1],
                                                    height: "5px",
                                                    width: "5px",
                                                    marginBottom: "2px",
                                                    marginRight: "3px"
                                            }}
                                        >
                                        </div>
                                        <div style={{display: "inline-block"}}>
                                            {tag[0]}
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        )
    }
}
AnnotatedChart.contextType = LanguageContext;

export default AnnotatedChart;