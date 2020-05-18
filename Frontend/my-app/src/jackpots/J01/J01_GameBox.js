import React from 'react';
import './J01_GameBox.css';

class GameBox extends React.Component{
    render(){
        const stateButton = {
            0: "J01_kicked_case",
            1: "J01_active_case",
            2: "J01_inactive_case",
            3: "J01_auth_case"
        };
        const stateMessage = {
            0: 'Kicked',
            1: 'Monitored',
            2: 'Submit',
            3: 'Not authenticated'
        };
        const gameButton = (this.props.state === 2)? <button onClick={() => {this.props.toParent(this.props.appid)}} >{stateMessage[this.props.state]}</button> : stateMessage[this.props.state]
        return(
            <div class="J01_gamebox"><article>
                <div class="J01_image_case">
                    <img src={this.props.image} alt={this.props.name} width="200"/>
                </div>
                <div class="J01_about_case">
                    <table>
                        <tr>
                            <th style={{textAlign:"left"}}>{this.props.name}</th>
                        </tr>
                        <tr>
                            <th style={{textAlign:"left"}}>{this.props.release}</th>
                        </tr>
                    </table>
                </div>
                <div class="J01_link_case">
                    <a
                        target="_blank"
                        title="Check players stats in SteamCharts"
                        href={`https://steamcharts.com/app/${this.props.appid}`}
                        rel="external"
                            >
                        <img
                            src={this.props.stats}
                            alt="SteamCharts link"
                            width="30"
                                />
                    </a>
                </div>
                <div class="J01_link_case">
                    <a
                        target="_blank"
                        title="Check this game in Steam Store"
                        href={`https://store.steampowered.com/app/${this.props.appid}`}
                        rel="external">
                        <img
                            src={this.props.store}
                            alt='SteamStore link'
                            width="100"
                                />
                    </a>
                </div>
                <div class={stateButton[this.props.state]}>
                    {gameButton}
                </div>
            </article></div>
        )
    }
}

export default GameBox;