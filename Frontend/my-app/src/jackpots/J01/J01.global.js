import React from "react";
import DescriptionBox from "../../display_components/descriptionbox";
import SimpleChart from "../../display_components/simplechart";
import BarChart from "../../display_components/barchart";
import GlobalTop from "../../display_components/globaltop";
import jackpotThumbnail from "../jackpot_icons/J01.jpg";

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
                        title: res.title,
                        entity: res.entity,
                        current_value: res.current_value,
                        current_users: res.current_users,
                        start: res.start.slice(0,10),
                        end: res.end.slice(0,10),
                        hasMultipliers: res.has_multipliers,
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
            return(
                <div>
                    <DescriptionBox
                        thumbnail={jackpotThumbnail}
                        alt='Event thumbnail'
                        title={this.state.title}
                        table={[
                            [["Sponsor",this.state.entity],["Start",this.state.start]],
                            [["Value",this.state.current_value],["End",this.state.end]],
                            [["Users",this.state.current_users],["Allows multipliers",this.state.has_multipliers]]
                        ]}
                    />
                    <SimpleChart points={this.state.users} title="Shareholders" yLabel="Shareholders"/>
                    <SimpleChart points={this.state.users} title="Price" yLabel="Price ($)"/>
                    <BarChart points={this.state.score} title="Wealth distribution" />
                    <GlobalTop top={this.state.top} />
                </div>
            )
        }
        else if((this.state.isLoaded===true) || (this.state.error===true)){
            return(<h1>Error</h1>)
        }
        else{
            return(<h1>Loading...</h1>);
        }
    }
}

export default J01Global;