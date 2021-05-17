//Standard
import { useReducer } from "react";

//Packages
import axios from "axios";

//Main function
const useApiCallback = (reducerFunction, initialState) => {
    const [state, dispatch] = useReducer(
        reducerFunction,
        initialState,
        () => initialState
    );

    const makeRequest = ({reducerMethod, apiMethod, apiUrl, apiPayload}) => {
        dispatch({type: 'load'});
        if(apiMethod === 'none'){
            dispatch({type: reducerMethod, payload: apiPayload})
        }
        else{
            axios({
                method: apiMethod,
                url: apiUrl,
                data: apiPayload
            })
            .then(reducerPayload => dispatch({type: reducerMethod, payload: reducerPayload.data}))
            .catch(err => {console.log(err);dispatch({type: 'error', payload: err})})
        }

    }

    return [state, makeRequest];
}
export default useApiCallback;