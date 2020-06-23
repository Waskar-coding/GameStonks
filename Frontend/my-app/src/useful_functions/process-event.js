
const processEvent = (language,event) => {
    const document = require('../language-display/timeline-classifier.json');
    const eventLength = event.length;
    const eventData = event.slice(3,eventLength);
    const eventDict = document[event[1]][event[2]][language];
    let eventString = eventDict[0];
    for(let i = 0; i < eventLength-3; i++){
        eventString = eventString + eventData[i]+ eventDict[i+1];
    }
    return [
        event[0],
        document[event[1]]["annotation-color"],
        document[event[1]]["timeline-color"],
        eventString
    ];
};

export default processEvent