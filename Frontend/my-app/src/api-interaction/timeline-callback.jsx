//Standard
import {useContext, useEffect} from "react";

//Context
import FunctionContext from "../context/function-context";

//Main function
const CallbackState = ({apiStatus, state}) => {
    const {setFunction} = useContext(FunctionContext);
    useEffect(() =>  {
        if(apiStatus === 200){
            setFunction({
                startDate: state.startDate,
                finalDate: state.finalDate,
                timeline: state.timeline,
                wealthPoints: state.wealthPoints,
                apiStatus: 200
            });
        }
        else{
            setFunction({
                startDate: new Date().toISOString(),
                finalDate: new Date().toISOString(),
                timeline: [],
                wealthPoints: [],
                apiStatus: apiStatus
            });
        }
    },[apiStatus,state])
    return null
};
export default CallbackState;