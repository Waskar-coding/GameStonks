//Standard
import React from "react";

//Packages
import { Bar } from "react-chartjs-2";

//Main function
const BarChart = ({title, points, labels, yLabel}) => {
    const data = {
        labels: labels,
        datasets: [
            {
                label: title,
                backgroundColor: 'rgba(75,192,192,1)',
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 2,
                data: points
            }
        ]
    };
    const options={
        title:{
            display:false,
            text: title,
            fontSize:20
        },
        legend:{
            display:false
        },
        scales: {
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
        <Bar data={data} options={options} />
    )
}
export default BarChart;