import React from 'react';
import './JackpotBox.css';

const statusDict = {
    new: 'NEW',
    i: 'INACTIVE',
    a: 'ACTIVE',
    k: 'KICKED'
};

class JackpotBox extends React.Component{
    iconPath = () => {
        if(this.props.jackpot_class !== "special"){
            return `./jackpot_icons/${this.props.jackpot_class}.jpg`
        }
        else{
            return `./jackpot_icons/${this.props.jackpot_id}.jpg`
        }
    };

    render(){
        const jackpotIcon = this.iconPath();
        const startdate = this.props.jackpot_start;
        const enddate = this.props.jackpot_end;
        const value = `${this.props.jackpot_value} $`;

        return(
            <div class="jackpot_box">
                <div class="jackpot_image_outercase">
                    <div class="jackpot_image_innercase">
                        <img src={require(`${jackpotIcon}`)} alt="jackpot_icon" width="170" height="170"/>
                    </div>
                </div>
                <div class="jackpot_description_case">
                    <h1 class="jackpot_title">{this.props.jackpot_title}</h1>
                    <table class="jackpot_description_table">
                        <tr>
                            <th style={{textAlign:"left"}}><h2>Class</h2></th>
                            <th style={{textAlign:"right"}}><h2>{this.props.jackpot_class}</h2></th>
                        </tr>
                        <tr>
                            <th style={{textAlign:"left"}}><h2>Sponsor</h2></th>
                            <th style={{textAlign:"right"}}><h2>{this.props.jackpot_entity}</h2></th>
                        </tr>
                        <tr>
                            <th style={{textAlign:"left"}}><h2>Start</h2></th>
                            <th style={{textAlign:"right"}}><h2>{startdate}</h2></th>
                        </tr>
                        <tr>
                            <th style={{textAlign:"left"}}><h2>End</h2></th>
                            <th style={{textAlign:"right"}}><h2>{enddate}</h2></th>
                        </tr>
                    </table>
                </div>
                <div class="jackpot_value_case">
                    <h1>{value}</h1>
                </div>
                <div class="jackpot_status_case">
                    <div class={this.props.jackpot_status}>{statusDict[this.props.jackpot_status]}</div>
                </div>
            </div>
        )
    }
}

export default JackpotBox;