import React from "react";
import { Bar } from "react-chartjs-2";

class BarChart extends React.PureComponent{
    render(){
        const data = {
            labels: ['Lowest 10%', '', '','', '','','','','Richest 10%'],
            datasets: [
                {
                    label: 'Wealth percentage',
                    backgroundColor: 'rgba(75,192,192,1)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 2,
                    data: this.props.points
                }
            ]
        };
        const options={
            title:{
                display:true,
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
                            labelString: 'Wealth percentage'
                        }
                    }
                ]
            }
        };
        if(this.props.points.length === 0){
            return(<div><div>Disabled, not enough players</div><Bar data={data} options={options} /></div>)
        }
        else{
            return(<Bar data={data} options={options} />)
        }
    }
}

export default BarChart;