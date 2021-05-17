const processMessage = (language, action) => {
    const document = require('./message-classifier.json');
    const actionDict = document[action[0]][action[1]][language];
    let actionString = actionDict[0];
    if(action.length < 3){
        return actionString
    }
    else{
        for(let i = 2; i < action.length; i++){
            actionString = actionString + action[i]+ actionDict[i-1];
        }
        return actionString;
    }
};
export default processMessage