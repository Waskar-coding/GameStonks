import React from "react";
import { Line } from "react-chartjs-2";
import 'chartjs-plugin-annotation';
import Math from 'math';

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
        const wealthDataset = this.props.points.map(point => {
            return {x: new Date(point[0]).getTime(), y: point[1]}
        });
        const data = {
            datasets: [
                {
                    label: this.props.title,
                    data: wealthDataset,
                    lineTension: 0,
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
            title: {
                display: true,
                text: this.props.title
            },
            tooltips: {
                enabled: true,
                mode: 'label',
                displayColors: false,
                callbacks: {
                    title: function(){},
                    label: function(tooltipItem, data) {
                        const date = new Date(tooltipItem.xLabel).toISOString().slice(0,10);
                        const hour = new Date(tooltipItem.xLabel).toISOString().slice(11,16);
                        return [date + ' ' + hour, tooltipItem.value.slice(0,5) + '$'];
                    }
                }
            },
            hover: {
                mode: 'dataset'
            },
            scales: {
                xAxes: [
                    {
                        type: 'linear',
                        ticks: {
                            mix: this.props.start.getTime(),
                            max: this.props.end.getTime(),
                            stepSize: (this.props.end.getTime()-this.props.start.getTime())/10,
                            callback: value => {
                                const date = new Date(value).toISOString();
                                return date.slice(0,10) + ' ' + date.slice(11,16);
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Date'
                        }
                    }
                ],
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

export default AnnotatedChart;