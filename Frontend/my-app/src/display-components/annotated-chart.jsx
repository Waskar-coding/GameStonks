//Standard
import React from "react";

//Packages
import { Line } from "react-chartjs-2";
import 'chartjs-plugin-annotation';

//Main function
const AnnotatedChart = ({title, points, actions, tooltips, tags, xAxes, yLabel}) => {
    const annotations = actions.map(action => {
        return {
            type: 'line',
            id: `${action[0]}_${action[1]}_${action[2]}`,
            mode: 'vertical',
            scaleID: 'x-axis-0',
            value: action[0].getTime(),
            borderColor: action[2],
            borderWidth: 2
        }
    });
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
                    {tags.map(tag => {
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
export default AnnotatedChart;