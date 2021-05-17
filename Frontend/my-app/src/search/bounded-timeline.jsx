//Standard
import React, {useState} from "react";

//Local components
import CallbackState from "../api-interaction/timeline-callback";
import DateForm from "./date-form";
import DefaultAPIGet from "../api-interaction/default-api-get";

//Context
import FunctionContext from "../context/function-context";

//Wrapped Main function
const WrappedBoundedTimeLine = ({contextSetter, state, apiPath, displayType}) => {
    return(
        <FunctionContext.Provider value={{setFunction: contextSetter}}>
            <InnerBoundedTimeLine
                joined={state.joined} defaultStartDate={state.startDate} defaultFinalDate={state.finalDate}
                path={apiPath} type={displayType}
            />
        </FunctionContext.Provider>
    )
}
export default React.memo(WrappedBoundedTimeLine);

//Inner Main function
const InnerBoundedTimeLine = ({joined, defaultStartDate, defaultFinalDate, path, type}) => {
    const [modified, setModified] = useState(false);
    const [dateLimits, setDateLimits] = useState({
        startDate: defaultStartDate, finalDate: defaultFinalDate
    });
    const submitGraphDateForm = (startDate, finalDate) => {
        if(((startDate !== defaultStartDate) || (finalDate !== defaultFinalDate)) && (!modified)){
            setDateLimits({startDate: startDate, finalDate: finalDate});
            setModified(true);
        }
        else setDateLimits({startDate: startDate, finalDate: finalDate})
    };
    return (
        <div>
            <DateForm
                minDate={new Date(joined)}
                maxDate={new Date(defaultFinalDate)}
                defaultStart={new Date(defaultStartDate)}
                defaultFinal={new Date(defaultFinalDate)}
                toParent={submitGraphDateForm}
            />
            {(modified)? (
                <DefaultAPIGet
                    url={`${path}?start=${dateLimits.startDate}&final=${dateLimits.finalDate}&type=${type}`}
                    LoadComponent={CallbackState}
                    loadMessage=""
                    ErrorComponent={CallbackState}
                    errorDict={{}}
                    render={(apiStatus, newState) => <CallbackState apiStatus={apiStatus} state={newState} />}
                />
            ): null}
        </div>
    )
}