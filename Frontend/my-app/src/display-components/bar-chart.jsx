//Standard
import React from "react";

//Packages
import { Bar } from "react-chartjs-2";



class BarChart extends React.PureComponent{
    render(){
        const data = {
            labels: this.props.labels,
            datasets: [
                {
                    label: this.props.title,
                    backgroundColor: 'rgba(75,192,192,1)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 2,
                    data: this.props.points
                }
            ]
        };
        const options={
            title:{
                display:false,
                text: this.props.title,
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
                            labelString: this.props.yLabel
                        }
                    }
                ]
            }
        };
        return(
            <Bar data={data} options={options} />
        )
    }
}

export default BarChart;