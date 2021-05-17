//Standard
import React, {useContext} from "react";

//Local components
import DescriptionBox from "../../../display-components/description-box";

//Useful functions
import configMoneyDisplay from "../../../data-manipulation/config-money-display";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Context
import LanguageContext from "../../../context/language-context";

//Main function
const DefaultPersonalDescriptionBox = ({name, thumbnail, register, products}) => {
    const language = useContext(LanguageContext);
    console.log(register);
    const currentShare = register.share_timetable[register.share_timetable.length - 1][1].toString();
    return(
        <DescriptionBox
            thumbnail={thumbnail} alt='User thumbnail' title={name}
            table={[
                [
                    [otherDict["event-personal"]["active"][language], register.date.split('T')[0]],
                    [otherDict["event-personal"]["monitored"][language], products.length]
                ],
                [
                    [
                        otherDict["event-personal"]["share"][language],
                        configMoneyDisplay(currentShare) +'$'
                    ],
                    [otherDict["event-personal"]["handshakes"][language], register.handshakes.length]
                ],
                [
                    [
                        otherDict["event-personal"]["update"][language],
                        register.share_timetable[register.share_timetable.length - 1][0].slice(0,10)
                    ],
                    [otherDict["event-personal"]["multipliers"][language], register.multipliers.length]
                ]
            ]}
        />
    )
}
export default DefaultPersonalDescriptionBox;