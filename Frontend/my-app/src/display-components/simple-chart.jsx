//Standard
import React from "react";

//Packages
import { Line } from "react-chartjs-2";

//Main function
const SimpleChart = ({title, points, tooltips, xAxes, yLabel}) => {
    const data = {
        datasets: [
            {
                label: title,
                data: points,
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
        tooltips: tooltips,
        hover: {
            mode: 'dataset'
        },
        scales: {
            xAxes: [xAxes],
            yAxes: [
                {
                    scaleLabel: {
                        display: true,
                        labelString: yLabel
                    }
                }
            ]
        }
    };
    return(
        <Line data={data} options={options} />
    )
}
export default SimpleChart;