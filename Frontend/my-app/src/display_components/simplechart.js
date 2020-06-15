import React from "react";
import { Line } from "react-chartjs-2";

class SimpleChart extends React.PureComponent{
    render(){
        const xData = this.props.points.map(point => {
            return point[0].slice(0,10);
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
                mode: 'label'
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
            }
        };
        return(
            <Line data={data} options={options} />
        )
    }
}

export default SimpleChart;