const processMessage = (language, event) => {
    const document = require('../language-display/message-classifier');
    const eventDict = document[event[0]][event[1]][language];
    let eventString = eventDict[0];
    if(event.length < 2){
        return eventString
    }
    else{
        for(let i = 2; i < event.length; i++){
            eventString = eventString + event[i]+ eventDict[i];
        }
        return eventString;
    }
};

export default processMessage