//Standard
import React from "react";

//Language jsons
import messageDict from "../language-display/message-classifier";

//Context
import LanguageContext from "../language-context";

class GlobalTop extends React.PureComponent{
    render(){
        if(this.props.players.length < 1){
            return(
                <div>{messageDict['jackpot-stats']['global-top']['empty'][this.context]}</div>
            )
        }
        else{
            return(
                <div>
                    <ul>
                        {this.props.players.map(topPlayer => {
                                return(
                                    <li key={topPlayer.thumbnail}>
                                        <div>
                                            <div>
                                                <img
                                                    src={topPlayer.thumbnail}
                                                    alt={`${topPlayer.name}'s thumbnail`}
                                                    width="50"
                                                />
                                            </div>
                                            <div>
                                                {topPlayer.name}
                                            </div>
                                            <div>
                                                Share: {topPlayer.share} $
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                    </ul>
                    {(this.props.players.length<10)? (
                        <div>{messageDict['jackpot-stats']['global-top']['incomplete'][this.context]}</div>
                    ): null
                    }
                </div>
            )
        }
    }
}
GlobalTop.contextType = LanguageContext;

export default GlobalTop;