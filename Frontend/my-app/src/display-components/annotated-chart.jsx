//Standard
import React from "react";

//Packages
import { Line } from "react-chartjs-2";
import 'chartjs-plugin-annotation';

//Main function
const AnnotatedChart = ({title, points, events, tooltips, tags, xAxes, yLabel}) => {
    const annotations = events.map(event => {
        return {
            type: 'line',
            id: `${event[0]}_${event[1]}`,
            mode: 'vertical',
            scaleID: 'x-axis-0',
            value: event[0].getTime(),
            borderColor: event[2],
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