//Standard
import React, {useContext} from "react";

//Local components
import DescriptionBox from "../../../display-components/description-box";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Context
import LanguageContext from "../../../language-context";

//Main function
const DefaultPersonalDescriptionBox = ({name, thumbnail, register, products}) => {
    const language = useContext(LanguageContext);
    const currentShare = register.share_timetable[register.share_timetable.length - 1][1].toString();
    return(
        <DescriptionBox
            thumbnail={thumbnail}
            alt='User thumbnail'
            title={name}
            table={[
                [
                    [
                        otherDict["jackpot-personal"]["active"][language],
                        register.date.split('T')[0]
                    ],
                    [
                        otherDict["jackpot-personal"]["monitored"][language],
                        products.length
                    ]
                ],
                [
                    [
                        otherDict["jackpot-personal"]["share"][language],
                        currentShare.split('.')[0] + '.' + currentShare.split('.')[1].slice(0,2) +'$'
                    ],
                    [
                        otherDict["jackpot-personal"]["handshakes"][language],
                        register.handshakes.length
                    ]
                ],
                [
                    [
                        otherDict["jackpot-personal"]["update"][language],
                        register.share_timetable[register.jackpot_timeline.length - 1][0].slice(0,10)
                    ],
                    [
                        otherDict["jackpot-personal"]["multipliers"][language],
                        register.multipliers.length
                    ]
                ]
            ]}
        />
    )
}
export default DefaultPersonalDescriptionBox;