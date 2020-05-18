import React from "react";
import {Line, Bar} from "react-chartjs-2";

class J01Global extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            resume: null,
            users: null,
            price: null,
            score: null,
            top: null,
            isLoaded: false,
            error: null
        };
    }
    componentDidMount(){
        fetch(``)
            .then(res => res.json())
            .then(
                (res) => {
                    this.setState({
                        resume: {
                            title: res.title,
                            entity: res.entity,
                            current_value: res.current_value,
                            current_users: res.current_users,
                            start: res.start.slice(0,10),
                            end: res.end.slice(0,10),
                            hasMultipliers: res.has_multipliers
                        },
                        users: res.users,
                        price: res.price,
                        score: res.score,
                        top: res.top,
                        isLoaded: true,
                        error: false
                    });
                },
                (error) =>{
                    this.setState({
                        isLoaded: true,
                        error: true
                    })
                })
    }
    render(){
        let loadContent;
        const jackpotId = this.props.jackpotId;
        if((this.state.isLoaded===true) || (this.state.error===false)){
            loadContent =
                <div>
                    <J01GlobalResume resume={this.state.resume} />
                    <J01GlobalLine points={this.state.users} title="Shareholders" yLabel="Shareholders"/>
                    <J01GlobalLine points={this.state.users} title="Price" yLabel="Price ($)"/>
                    <J01GlobalBarChart points={this.state.score} title="Wealth distribution" />
                    <J01GlobalTop top={this.state.top} />
                </div>;
        }
        else if((this.state.isLoaded===true) || (this.state.error===true)){
            loadContent = <h1>Error</h1>
        }
        else{
            loadContent = <h1>Loading...</h1>;
        }
        return(
            <div>{loadContent}</div>
        )
    }
}


class J01GlobalResume extends React.Component{
    render(){
        return(
            <div>
                <div class="Jackpot_title"><h1>{this.props.resume.title}</h1></div>
                <div class="J01_image_case">
                    <img src={require("../jackpot_icons/J01.jpg")} alt="jackpot_icon" width="170" height="170"/>
                </div>
                <table class="J01_resume_table">
                    <tr>
                        <th style={{textAlign:"left"}} ><p>Created by:</p></th>
                        <td style={{textAlign:"right"}} ><p>{this.props.resume.entity}</p></td>
                        <th style={{textAlign:"left"}}><p>Starting date:</p></th>
                        <td style={{textAlign:"right"}}><p>{this.props.resume.start}</p></td>
                    </tr>
                    <tr>
                        <th style={{textAlign:"left"}}><p>Current value:</p></th>
                        <td style={{textAlign:"right"}}><p>{this.props.resume.current_value} $</p></td>
                        <th style={{textAlign:"left"}}><p>Ending date:</p></th>
                        <td style={{textAlign:"right"}}><p>{this.props.resume.end}</p></td>
                    </tr>
                    <tr>
                        <th style={{textAlign:"left"}}><p>Current users:</p></th>
                        <td style={{textAlign:"right"}}><p>{this.props.resume.current_users}</p></td>
                        <th style={{textAlign:"left"}}><p>Multipliers:</p></th>
                        <td style={{textAlign:"right"}}><p>{this.props.resume.hasMultipliers}</p></td>
                    </tr>
                </table>
            </div>
        )
    }
}


class J01GlobalLine extends React.Component{
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


class J01GlobalBarChart extends React.Component{
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
        let barDisplay;
        if(this.props.points.length === 0){
            barDisplay =  <div><div>Disabled, not enough players</div><Bar data={data} options={options} /></div>;
        }
        else{
            barDisplay = <Bar data={data} options={options} />;
        }
        return(
            <div>{barDisplay}</div>
        )
    }
}

class J01GlobalTop extends React.Component{
    constructor(props){
        super(props);
        const isEmpty = props.top.length === 0;
        const isIncomplete = (isEmpty === false) && (props.top.length < 10);
        this.state = {
            isEmpty: isEmpty,
            isIncomplete: isIncomplete,
            isLoaded: false,
            players: []
        };
    }
    componentDidMount(){
        if(this.state.isEmpty === false){
            getTopRegisters(this)
        }
        else{
            this.setState({
                isLoaded: true
            })
        }
    }
    render(){
        let renderContent;
        if(this.state.isLoaded === true){
            const renderEmpty = (this.state.isEmpty === true)? <div>No players yet</div> : null
            const renderIncomplete = ((renderEmpty === null) && (this.state.isIncomplete === true))?
                <div>Not enough players for a complete top 10</div>
                :
                null;
            const renderTopPlayers = (this.state.players !== [])?
                <div>
                    {this.state.players.map(topPlayer => {
                    return <div><div><img src={topPlayer.thumbnail} alt={`${topPlayer.name}'s thumbnail`} width="50"/></div><div>{topPlayer.name}</div><div>Share: {topPlayer.score} $</div></div>;
                    })}
                </div>
            :
            null;
            renderContent = <div>{renderEmpty}{renderIncomplete}{renderTopPlayers}</div>;
        }
        else{
            renderContent = <div>Loading ...</div>
        }


        return(
            <div>{renderContent}</div>
        )
    }
}

const getTopRegisters = async (session) => {
    let i=0;
    const topRegisters = [];
    for(i;i< session.props.top.length; i++){
        const response = await fetch(`../../users/${session.props.top[i][0]}`);
        const json = await response.json();
        topRegisters.push({name: json.name, thumbnail: json.thumbnail,score: session.props.top[i][1]});
        if(i === session.props.top.length-1){
            session.setState({
                players: topRegisters,
                isLoaded: true
            })
        }
    }
};

export default J01Global;