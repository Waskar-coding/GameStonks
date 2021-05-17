//Standard
import React, {useContext, useRef, useState} from "react";

//Packages
import Tippy from "@tippy.js/react";

//Local components
import DefaultError from "../error-components/default-error";
import MultiplierRouter from "./multiplier-router";
import SimpleList from "../display-components/simple-list";

//Useful functions
import sortMultipliers, {sortByClass} from "./multiplier-sort";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";
import otherDict from "../language-display/other-classifier.json";

//Context
import FunctionContext from "../context/function-context";
import LanguageContext from "../context/language-context";
import MultiplierContext from "../context/multiplier-context";

//Main function
const MultiplierForm = ({maxMultipliers, hasProducts}) => {
    const language = useContext(LanguageContext);
    const {available, used} = useContext(MultiplierContext);
    const multipliers = Object.keys(sortByClass(available));
    const [currentClass, setCurrentClass] = useState(multipliers.length > 0? multipliers[0] : "");
    const [currentMultiplier, setCurrentMultiplier] = useState("");
    const handleSubmit = event => {
        event.preventDefault();
        for(let multiplier of available){
            if(multiplier.split('_')[0] === currentClass){
                setCurrentMultiplier(multiplier);
                break;
            }
        }
        setDisplay(200);
        setTimeout(submitButton.current.blur(),500);
    };
    const [display, setDisplay] = useState(0);
    const submitButton = useRef(null);
    const errorDict = {404: 'multipliers-empty', 403: 'multipliers-max', 400: 'multipliers-no-products'};
    return (
        <div>
            <h1>{otherDict['event-personal']['multipliers'][language]}</h1>
            <SimpleList 
                title={otherDict['event-personal']['available-multipliers'][language]} 
                list={sortMultipliers(available, false,language)} useLinks={false} target=""
            />
            <SimpleList 
                title={otherDict['event-personal']['used-multipliers'][language]} 
                list={sortMultipliers(used,false ,language)} useLinks={false} target=""
            />
            {(hasProducts && (multipliers.length > 0) && (used.length < maxMultipliers))? (
                <React.Fragment>
                    <form onSubmit={handleSubmit}>
                        <label id="wealth">{interactiveDict['request-form']['amount'][language]}</label>
                        <select id="wealth" onChange={(event) => {setCurrentClass(event.target.value)}}>
                            {multipliers.map(m => {return <option key={m} value={m}>{m}</option>})}
                        </select>
                        <Tippy content={interactiveDict['multiplier-form']['tooltip'][language]}>
                            <input
                                ref={submitButton} type='submit'
                                value={interactiveDict['multiplier-form']['multiplier-submit'][language]}
                            />
                        </Tippy>
                    </form>
                    <FunctionContext.Provider value={(displayState) => setDisplay(displayState)}>
                        <MultiplierRouter
                            multiplier={currentMultiplier} multiplierClass={currentClass} display={display}
                        />
                    </FunctionContext.Provider>
                </React.Fragment>
            ) : (
                hasProducts? (
                    multipliers.length > 0? (
                        <DefaultError apiStatus={403} errorDict={errorDict} />
                    ) : (
                        <DefaultError apiStatus={404} errorDict={errorDict} />
                    )
                ) : (
                    <DefaultError apiStatus={400} errorDict={errorDict} />
                )
            )}
        </div>
    )
}
export default MultiplierForm;