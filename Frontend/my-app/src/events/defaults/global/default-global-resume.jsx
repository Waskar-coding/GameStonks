//Standard
import React from "react";

//Local components
import otherDict from "../../../language-display/other-classifier.json";
import DescriptionBox from "../../../display-components/description-box";

//Useful functions
import configMoneyDisplay from "../../../data-manipulation/config-money-display";

//Main function
const DefaultGlobalResume = ({
    title, entity, start, final,
    currentValue, currentUsers,
    eventThumbnail ,multipliers, language
}) => {
    return (
        <DescriptionBox
            thumbnail={eventThumbnail}
            alt='Event thumbnail'
            title={title}
            table={[
                [
                    [
                        otherDict['event']['event-sponsor'][language],
                        entity
                    ],
                    [
                        otherDict['event']['event-start'][language],
                        start.toISOString().slice(0,10)
                    ]
                ],
                [
                    [
                        otherDict['event']['event-value'][language],
                        `${configMoneyDisplay(currentValue)} $`
                    ],
                    [
                        otherDict['event']['event-final'][language],
                        final.toISOString().slice(0,10)
                    ]
                ],
                [
                    [
                        otherDict['event']['event-users'][language],
                        currentUsers
                    ],
                    [
                        otherDict['event']['event-allowed-multipliers'][language],
                        multipliers
                    ]
                ]
            ]}
        />
    )
}
export default DefaultGlobalResume;