//Useful functions
import getLocalDate from "../data-manipulation/date-offset";

//Language jsons
import actionDict from "./action-classifier.json";

//Main function
const processAction = (language, person, action) => {
    const myAction = actionDict[action[1]][action[2]][language][person];
    let actionString = myAction[0];
    let actionParam;
    for(let i = 3; i < action.length; i++){
        actionParam = typeof action[i] === 'object' ? action[i][language] : action[i];
        actionString = actionString + actionParam + myAction[i-2];
    }
    return [
        getLocalDate(new Date(action[0])),
        actionDict[action[1]]["annotation-color"],
        actionDict[action[1]]["timeline-color"],
        actionString
    ];
};

export default processAction