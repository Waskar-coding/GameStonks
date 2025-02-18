//Standard
import React from "react";

//Useful functions
import configMoneyDisplay from "../data-manipulation/config-money-display";

//Main function
const GlobalTop = ({players, completeLength, incompleteMessage}) => {
    return(
        <div>
            <ul>
                {players.map(topPlayer => {
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
                                    Share: {configMoneyDisplay(topPlayer.share)} $
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
            {(players.length< completeLength)? (
                <div>{incompleteMessage}</div>
            ): null
            }
        </div>
    )
}
export default GlobalTop;