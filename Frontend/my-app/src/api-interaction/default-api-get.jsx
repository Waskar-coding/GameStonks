//Standard
import React, {useEffect, useReducer} from "react";

//Packages
import axios from "axios";

//Reducer function
const reducer = (state, action) => {
    switch(action.type){
        case "GET_SUCCESS": return {currentUrl: action.url, status: 200, data: action.payload}
        case "GET_ERROR": return{currentUrl: action.url, status: action.status}
        default: return{data: state.data}
    }
}

//Main function
const DefaultAPIGet = React.memo((
    {LoadComponent, ErrorComponent, url, loadMessage, errorDict, render}
) => {
    const [state, dispatch] = useReducer(reducer, { currentUrl: "", status: 0, data: {}});
    useEffect(() => {
        console.log('using api');
        axios.get(url)
            .then(res => {dispatch({type: 'GET_SUCCESS', payload: res.data, url: url})})
            .catch(err => {console.log(err); dispatch({type: 'GET_ERROR', status: err.response.status, url: url})})
    },[url])
    if(state.currentUrl !== url)  return <LoadComponent apiStatus={0} loadMessage={loadMessage} state={{}}/>
    else if((state.status !== 200) && (state.status !== 100)){
        return <ErrorComponent apiStatus={state.status} errorDict={errorDict} state={{}} />
    }
    else return <React.Fragment>{render(state.status, state.data)}</React.Fragment>
})
export default DefaultAPIGet;