//Standard
import React, {useContext, useState} from "react";

//Local components
import DefaultPersonalDescriptionBox from "./default-personal-description-box";
import DefaultPersonalHandshakes from "./default-personal-handshakes";
import DefaultPersonalTimeLineGraph from "./default-personal-timeline-graph";
import DefaultPersonalTimeLineList from "./default-personal-timeline-list";
import MultiplierForm from "../../../multipliers/multiplier-form";
import SearchProductRegister from "../../../search/search-product-register";

//Useful functions
import getLocalDate from "../../../data-manipulation/date-offset";
import processAction from "../../../language-display/process-action";

//Language jsons
import otherDict from "../../../language-display/other-classifier.json";

//Context
import LanguageContext from "../../../context/language-context";
import MultiplierContext from "../../../context/multiplier-context";

//Main function
const DefaultPersonalStack = (
    {eventId, name, thumbnail, availableMultipliers, userRegister, products, maxMultipliers, children}
) => {
    const language = useContext(LanguageContext);
    const [register, setRegister] = useState(userRegister);
    const [available, setAvailable] = useState(availableMultipliers);
    const [used, setUsed] = useState(register.multipliers);
    const timeline = register.event_timeline.map(action => {return processAction(language, '1st', action)});
    const share = register.share_timetable.map(point => {return({x: getLocalDate(new Date(point[0])), y: point[1]})});
    return(
        <div>
            <DefaultPersonalDescriptionBox name={name} thumbnail={thumbnail} register={register} products={products} />
            <MultiplierContext.Provider value={{
                eventId: eventId, userName: name, userThumbnail: thumbnail, setRegister: setRegister,
                available: available, setAvailable: setAvailable, used: used, setUsed: setUsed
            }}>
                <MultiplierForm maxMultipliers={maxMultipliers} hasProducts={userRegister.products.length > 0}/>
            </MultiplierContext.Provider>
            <DefaultPersonalHandshakes handshakes={register.handshakes} />
            <DefaultPersonalTimeLineGraph date={register.date} share={share} timeline={timeline} />
            <div>
                <h3>{otherDict['event-personal']['visualize-title'][language]}</h3>
                <SearchProductRegister products={products}>{children}</SearchProductRegister>
            </div>
            <DefaultPersonalTimeLineList timeline={timeline.reverse()} />
        </div>
    )
}
export default DefaultPersonalStack;