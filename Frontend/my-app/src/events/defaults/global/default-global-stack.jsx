//Standard
import React, {useContext} from "react";
import configDefaultXAxes from "../../../chart-configuration/xaxes-default-config";
import LanguageContext from "../../../context/language-context";
import DefaultGlobalResume from "./default-global-resume";
import WrappedDefaultGlobalUserChart from "./wrapped-default-global-user-chart";
import WrappedDefaultGlobalValueChart from "./wrapped-default-global-value-chart";
import WrappedDefaultGlobalDistributionChart from "./wrapped-default-global-distribution-chart";
import WrappedDefaultGlobalTop from "./wrapped-default-global-top";

//Main function
const DefaultGlobalStack = ({
    title, entity, start, final,
    currentValue, currentUsers,
    eventThumbnail ,multipliers, score,
    users, price, top
}) => {
    const language = useContext(LanguageContext);
    const xAxes = configDefaultXAxes(start, final, language);
    return (
        <div>
            <DefaultGlobalResume
                title={title}
                entity={entity}
                start={start}
                final={final}
                currentValue={currentValue}
                currentUsers={currentUsers}
                eventThumbnail={eventThumbnail}
                multipliers={multipliers}
                language={language}
            />
            <WrappedDefaultGlobalUserChart users={users} xAxes={xAxes} language={language}/>
            <WrappedDefaultGlobalValueChart price={price} xAxes={xAxes} language={language}/>
            <WrappedDefaultGlobalDistributionChart score={score} language={language}/>
            <WrappedDefaultGlobalTop top={top} language={language} />
        </div>
    )
}
export default DefaultGlobalStack;