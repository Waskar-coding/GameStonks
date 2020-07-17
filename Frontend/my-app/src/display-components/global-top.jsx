//Standard
import React from "react";

//Context
import LanguageContext from "../language-context";

class GlobalTop extends React.PureComponent{
    render(){
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
                {(this.props.players.length< this.props.completeLength)? (
                    <div>{this.props.incompleteMessage}</div>
                ): null
                }
            </div>
        )
    }
}
GlobalTop.contextType = LanguageContext;

export default GlobalTop;