import React from "react";
import { Line } from "react-chartjs-2";
import 'chartjs-plugin-annotation';
const lineChartInst = {};

class AnnotatedChart extends React.PureComponent{
    render(){
        const events = this.props.events;
        const backgroundColors = {
            arrival: 'green',
            monitored: 'purple',
            recommendation: 'blue',
            multiplier: 'orange',
            reward: 'green',
            donation: 'purple',
            present: 'blue',
            fund: 'orange'
        };
        const legend = this.props.tags.map(tag => {
            return <div style={{display: "inline-block", margin: "8px"}}>
                <div
                    style={{
                        display: "inline-block",
                        backgroundColor: backgroundColors[tag],
                        height: "5px",
                        width: "5px",
                        marginBottom: "2px",
                        marginRight: "3px"
                    }}>
                </div>
                <div style={{display: "inline-block"}}>{tag}</div>
            </div>
        });
        const annotations = events.map(event => {
            return {
                type: 'line',
                id: `${event[0]}_${event[2]}`,
                mode: 'vertical',
                scaleID: 'x-axis-0',
                value: event[0],
                borderColor: backgroundColors[event[2]],
                borderWidth: 2
            }
        });
        const xData = this.props.points.map(point => {
            return point[0];
        });
        const yData = this.props.points.map(point => {
            return point[1];
        });
        const data = {
            labels: xData,
            datasets: [
                {
                    label: this.props.title,
                    data: yData,
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
                    label: function(tooltipItem, data) {
                        const multistringText = [tooltipItem.yLabel];
                        for(let event of events){
                            if(data.labels[tooltipItem.index] === event[0]){
                                multistringText.push(event[1]);
                                return multistringText;
                            }
                        }
                        return multistringText;
                    }
                }
            },
            hover: {
                mode: 'dataset'
            },
            scales: {
                xAxes: [
                    {
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
                <Line data={data} options={options} ref={lineChartInst}/>
                <div style={{textAlign: "center"}}>{legend}</div>
            </div>
        )
    }
}

export default AnnotatedChart;