//Standard
import React, {useContext, useRef, useState} from "react";

//Packages
import Tippy from "@tippy.js/react";

//Local components
import UserRequestValueChecking from "./user-request-value-checking";

//Language jsons
import interactiveDict from "../../language-display/interactive-classifier.json";
import messageDict from "../../language-display/message-classifier.json";
import otherDict from "../../language-display/other-classifier.json";

//Context
import FunctionContext from "../../context/function-context";
import LanguageContext from "../../context/language-context";
import TransactionContext from "../../context/transaction-context";

//Wrapped main function
const WrappedRequestForm = () => {
    const language = useContext(LanguageContext);
    const {userWealth, profile} = useContext(TransactionContext);
    return(
        <div>
            <table>
                <thead>
                <tr key="request_head">
                    <th key="request_date">{otherDict["profile"]["request-table-date"][language]}</th>
                    <th key="request_cash">{otherDict["profile"]["request-table-cash"][language]} ($)</th>
                    <th key="request-platform">{otherDict["profile"]["request-table-platform"][language]}</th>
                </tr>
                </thead>
                <tbody>
                    {profile.requests.length > 0? (
                        profile.requests.map(request => {return (
                            <tr key={request.request_date}>
                                <td key={`${request.request_date}_date`}>{request.request_date}</td>
                                <td key={`${request.request_date}_cash`}>{request.request_cash} $</td>
                                <td key={`${request.request_date}_platform`}>{request.request_type}</td>
                            </tr>
                        )})
                    ):(
                        <tr key="error_r">
                            <td key="error_c">
                                {messageDict['profile-requests']['no-requests'][language]}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {profile.requests.length > 2? (
                <div>{messageDict['error']['request-length'][language]}</div>
            ) : (
                userWealth < 5? (<div>{messageDict['error']['request-cash'][language]}</div>) : (<InnerRequestForm />)
            )}
        </div>
    )
}
export default WrappedRequestForm;

//Inner main function
const InnerRequestForm = () => {
    const language = useContext(LanguageContext);
    const {userWealth} = useContext(TransactionContext);
    const wealthArray = [5,10,20,25,50,100].filter(cash => {return cash <= userWealth});
    const [cashOut, setCashOut] = useState(5);
    const [display, setDisplay] = useState(0);
    const handleChange = e => {setCashOut(e.target.value)}
    const handleSubmit = e => {
        e.preventDefault();
        setDisplay(200);
        setTimeout(submitButton.current.blur(),500);
    }
    const submitButton = useRef(null);
    return(
        <React.Fragment>
            <form onSubmit={handleSubmit}>
                <label id="wealth">{interactiveDict['request-form']['amount'][language]}</label>
                <select id="wealth" onChange={handleChange}>
                    {wealthArray.map(price => {return <option key={price} value={price}>{`${price} $`}</option>})}
                </select>
                <Tippy content={interactiveDict['request-form']['tooltip'][language]}>
                    <input
                        ref={submitButton} type='submit'
                        value={interactiveDict['request-form']['request-submit'][language]}
                    />
                </Tippy>
            </form>
            <FunctionContext.Provider value={(displayState) => setDisplay(displayState)}>
                <UserRequestValueChecking request={cashOut} display={display} setDisplay={setDisplay} />
            </FunctionContext.Provider>
        </React.Fragment>
    )
}