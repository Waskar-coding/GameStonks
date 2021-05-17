//Standard
import React, {useContext} from "react";

//Useful components
import DefaultLoad from "../../load-components/default-load";
import DefaultError from "../../error-components/default-error";
import TimeLine from "../../display-components/timeline";

//Language jsons
import messageDict from "../../language-display/message-classifier.json";

//Context
import LanguageContext from "../../context/language-context";

//Main function
const UserTimelineList = ({listStatus, processedListTimeLine}) => {
    const language = useContext(LanguageContext);
    switch (listStatus) {
        case 0: return <DefaultLoad loadMessage={"list-timeline"} />
        case 200:
            if(processedListTimeLine.length > 0){ return <TimeLine actions={processedListTimeLine} />}
            else{return(<div>{messageDict['error']["list-timeline-404"][language]}</div>)}
        default: return <DefaultError errorDict={{500: "list-timeline-500"}} />
    }
}
export default UserTimelineList;