//Standard
import React from "react";

//Packages
import { Line } from "react-chartjs-2";

//Context
import LanguageContext from "../language-context";

class SimpleChart extends React.PureComponent{
    render(){
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
            }
        };
        return(
            <Line data={data} options={options} />
        )
    }
}
SimpleChart.contextType = LanguageContext;

export default SimpleChart;