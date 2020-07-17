//Standard
import React, { useEffect, useReducer, useContext} from "react";

//Packages
import axios from "axios";

//Language jsons
import messageDict from "../language-display/message-classifier.json";

//Context
import LanguageContext from "../language-context";

//Reducer function
const reducer = (state, action) => {
    switch(action.type){
        case "GET_SUCCESS":
            return {
                loading: false,
                status: 200,
                data: action.payload
            }
        case "GET_ERROR":
            return{
                loading: false,
                status: action.status
            }
        default:
            return{
                data: state.data
            }
    }
}

//Main function
const DefaultAPIGet = ({url, loadMessage, errorMessage, children}) => {
    const language = useContext(LanguageContext);
    const [state, dispatch] = useReducer(reducer, {
        loading: true,
        status: 0,
        data: {}
    });
    useEffect(() => {
        axios.get(url)
            .then(res => {
                dispatch({type: 'GET_SUCCESS', payload: res.data})
            })
            .catch(err => {
                console.log(err);
                dispatch({type: 'GET_ERROR', status: err.response.status})
            })
    },[url])
    if(state.loading === true){
        return(<div>{messageDict['loading'][loadMessage][language]}</div>)
    }
    else if(state.status !== 200){
        return(<div>{messageDict['error'][errorMessage[state.status]][language]}</div>)
    }
    else{
        return(
            <div>
                {
                    React.cloneElement(children, {
                        state: state.data
                    })
                }
            </div>
        )
    }
}
export default DefaultAPIGet;