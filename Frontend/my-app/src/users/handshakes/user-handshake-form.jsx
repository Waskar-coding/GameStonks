//Standard
import React, {useContext, useRef, useState} from "react";

//Packages
import Tippy from "@tippy.js/react";

//Local components
import DefaultError from "../../error-components/default-error";
import Handshake from "./user-handshake-checking";

//Language jsons
import interactiveDict from "../../language-display/interactive-classifier.json";

//Context
import FunctionContext from "../../context/function-context";
import LanguageContext from "../../context/language-context";
import TransactionContext from "../../context/transaction-context";

//Wrapped main function
const WrappedHandshakeForm = () => {
    const {handshake} = useContext(TransactionContext);
    const {isAuth, multipliers, events} = handshake;
    const errorDict = {402: "handshake-402", "403-1": "handshake-multipliers", "403-2": "handshake-events"};
    if(!isAuth){return <DefaultError apiStatus={402} errorDict={errorDict}/>}
    else{
        const availableHandshakes = multipliers.filter(multiplier => {return multiplier.split('_')[0] === "handshake"});
        if(availableHandshakes.length === 0){return <DefaultError apiStatus="403-1" errorDict={errorDict} />}
        else if(events.length === 0){return <DefaultError apiStatus="403-2" errorDict={errorDict} />}
        else{
            return(
                <div>
                    <div>{`Available handshakes: ${availableHandshakes.length}`}</div>
                    <div>{`Allowed events: ${events.length}`}</div>
                    <InnerHandshakeForm events={events} multiplier={availableHandshakes[0]} />
                </div>
            )

        }
    }
}
export default React.memo(WrappedHandshakeForm);

//Inner main function
const InnerHandshakeForm = ({events, multiplier}) => {
    const language = useContext(LanguageContext);
    const [event, setEvent] = useState(events[0]);
    const [display, setDisplay] = useState(0);
    const handleChange = event => {setEvent(event.target.value)}
    const handleSubmit = event => {
        event.preventDefault();
        setDisplay(100);
        setTimeout(submitButton.current.blur(),500);
    }
    const submitButton = useRef(null);
    return(
        <React.Fragment>
            <form onSubmit={handleSubmit}>
                <label id="event">{interactiveDict['request-form']['amount'][language]}</label>
                <select id="event" onChange={handleChange}>
                    {events.map(event => {return <option key={event} value={event}>{event}</option>})}
                </select>
                <Tippy content={interactiveDict['handshake-user-form']['tooltip'][language]}>
                    <input
                        ref={submitButton} type='submit'
                        value={interactiveDict['handshake-user-form']['handshake-submit'][language]}
                    />
                </Tippy>
            </form>
            <FunctionContext.Provider value={(displayState) => setDisplay(displayState)}>
                <Handshake eventId={event} multiplier={multiplier} display={display} />
            </FunctionContext.Provider>
        </React.Fragment>
    )
}