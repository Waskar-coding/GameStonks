//Standard
import React, {useContext} from "react";

//Local components
import SendItemNumber from "./send-item-number";

//Language jsons
import messageDict from "../language-display/message-classifier.json";

//Context
import LanguageContext from "../context/language-context";

//Main function
const SearchItemList = ({state, notFound, idName, ItemElement}) => {
    const language = useContext(LanguageContext);
    return (
        <div className="jackpot_list">
            <SendItemNumber itemNumber={state.current_n}/>
            {(state.current_n)? (
                <nav>
                    <ul style={{listStyleType: "none"}}>
                        {state.items.map(item => <li key={item[idName]}><ItemElement item={item} state={state} /></li>)}
                    </ul>
                </nav>
            ) : (
                messageDict['error'][notFound][language]
            )}
        </div>
    )
}
export default SearchItemList;