const processEvent = (language, event) => {
    const document = require('../language-display/timeline-classifier.json');
    const eventDict = document[event[1]][event[2]][language];
    let eventString = eventDict[0];
    for(let i = 3; i < event.length; i++){
        eventString = eventString + event[i] + eventDict[i-2];
    }
    return [
        event[0],
        document[event[1]]["annotation-color"],
        document[event[1]]["timeline-color"],
        eventString
    ];
};

export default processEvent