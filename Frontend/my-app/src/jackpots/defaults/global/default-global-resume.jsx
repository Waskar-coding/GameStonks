//Standard
import React from "react";

//Local components
import otherDict from "../../../language-display/other-classifier.json";
import DescriptionBox from "../../../display-components/description-box";

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
                        otherDict['jackpot']['jackpot-sponsor'][language],
                        entity
                    ],
                    [
                        otherDict['jackpot']['jackpot-start'][language],
                        start.toISOString().slice(0,10)
                    ]
                ],
                [
                    [
                        otherDict['jackpot']['jackpot-value'][language],
                        currentValue
                    ],
                    [
                        otherDict['jackpot']['jackpot-final'][language],
                        final.toISOString().slice(0,10)
                    ]
                ],
                [
                    [
                        otherDict['jackpot']['jackpot-users'][language],
                        currentUsers
                    ],
                    [
                        otherDict['jackpot']['jackpot-allowed-multipliers'][language],
                        multipliers
                    ]
                ]
            ]}
        />
    )
}
export default DefaultGlobalResume;