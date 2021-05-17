//Standard
import React, {useContext, useReducer} from "react";

//Packages
import axios from "axios";

//Local components
import ModalConfirm from "../modals/modal-confirm";
import ModalMessage from "../modals/modal-message";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";

//Context
import LanguageContext from "../context/language-context";
import LoadModal from "../load-components/load-modal";

//Reducer function
const reducer = (state, action) => {
    switch(action.type){
        case "LOAD": return {status: 100}
        case "GET_SUCCESS": return {status: 200, data: action.payload}
        case "GET_ERROR": return {status: action.status}
        default: return{data: state.data}
    }
}

//Post api
const handleConfirmClick = (url, requestBody, dispatch, method) => {
    dispatch({type: "LOAD"});
    const usedMethod = method!== undefined? method : 'post';
    axios({method: usedMethod, url: url, baseUrl: 'https://localhost:8080', data: requestBody})
        .then(res => { dispatch({type: 'GET_SUCCESS', payload: res.data})})
        .catch(err => {console.log(err); dispatch({type: 'GET_ERROR', status: err.response.status})})
};

//Main function
const DefaultAPIPost = React.memo((
    {confirm, success, error, url, requestBody, loadMessage, toParentClose, confirmButton, updateFunction, method}
) => {
    const language = useContext(LanguageContext);
    const [state, dispatch] = useReducer(reducer, { status: 0, data: {}});
    switch(state.status){
        case 0:
            return(
                <ModalConfirm
                    toParentConfirm={() =>{handleConfirmClick(url, requestBody, dispatch, method)}}
                    toParentCancel={() => {toParentClose()}}
                    confirmMessage={confirmButton}
                    cancelMessage={interactiveDict["confirm-modal"]["cancel"][language]}
                >
                    {confirm()}
                </ModalConfirm>
            )
        case 100: return <LoadModal loadMessage={loadMessage} />
        case 200:
            return(
                <ModalMessage
                    toParent={() => {updateFunction(state.data); toParentClose()}}
                    message={interactiveDict["message-modal"]["ok"][language]}
                >
                    {success(state.data)}
                </ModalMessage>
            )
        default:
            return(
                <ModalMessage
                    toParent={() => {toParentClose()}}
                    message={interactiveDict["message-modal"]["close"][language]}
                >
                    {error(state.status)}
                </ModalMessage>
            )
    }
})
export default DefaultAPIPost;