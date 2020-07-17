//Standard
import React, {useContext} from "react";

//Local components
import DefaultPersonalDescriptionBox from "./default-personal-description-box";
import DefaultPersonalHandshakes from "./default-personal-handshakes";
import DefaultPersonalTimeLineGraph from "./default-personal-timeline-graph";
import DefaultPersonalTimeLineList from "./default-personal-timeline-list";
import SearchProductRegister from "../../../search/search-product-register";

//Useful functions
import getLocalDate from "../../../useful-functions/date-offset";
import processEvent from "../../../useful-functions/process-event";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Context
import LanguageContext from "../../../language-context";

//Main function
const DefaultPersonalStack = ({name, thumbnail, register, products, children}) => {
    const language = useContext(LanguageContext);
    const timeline = register.jackpot_timeline.map(event => {
        return processEvent(language, '1st', event)
    });
    const share = register.share_timetable.map(point => {
        return(
            {
                x: getLocalDate(new Date(point[0])),
                y: point[1]
            }
        )
    });
    return(
        <div>
            <DefaultPersonalDescriptionBox
                name={name}
                thumbnail={thumbnail}
                register={register}
                products={products}
                usedMultipliers={register.multipliers}
            />
            <DefaultPersonalHandshakes
                handshakes={register.handshakes}
            />
            <DefaultPersonalTimeLineGraph
                date={register.date}
                share={share}
                timeline={timeline}
            />
            <div>
                <h3>{otherDict['jackpot-personal']['visualize-title'][language]}</h3>
                <SearchProductRegister
                    products={products}
                >
                    {children}
                </SearchProductRegister>
            </div>
            <DefaultPersonalTimeLineList
                timeline={timeline.reverse()}
            />
        </div>
    )
}
export default DefaultPersonalStack;