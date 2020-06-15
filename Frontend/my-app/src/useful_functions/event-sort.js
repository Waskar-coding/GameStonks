const mergeEvents = (timeEvents, eventItems) => {
    const eventKeyWords = {
        monitored: {
            type: "onePointObject",
            date: "register_date",
            value: "name",
            start: "Permission to monitor",
            end: ""
        },
        recommendation: {
            type: "list",
            date: 0,
            value: 1,
            start: "",
            end: "gave you a handshake"
        },
        multiplier: {
            type: "list",
            date: 0,
            value: 1,
            start: "Used a",
            end: "multiplier"
        },
        arrival: {
            type: "onePointObject",
            date: "date",
            value: "jackpot_id",
            start: "",
            end: ""
        },
        reward: {
            type: "twoPointObject",
            date: "transaction_date",
            value1: "transaction_data",
            value2: "transaction_cash",
            start: "You received",
            mid: "$ from event",
            end: ""
        },
        donation: {
            type: "twoPointObject",
            date: "transaction_date",
            value1: "transaction_data",
            value2: "transaction_cash",
            start: "You donated",
            mid: "$ to",
            end: ""
        },
        present: {
            type: "twoPointObject",
            date: "transaction_date",
            value1: "transaction_data",
            value2: "transaction_cash",
            start: "You received",
            mid: "$ from",
            end: ""
        },
        fund: {
            type: "onePointobject",
            date: "transaction_date",
            value: "transaction_cash",
            start: "You added",
            end: "$ to your steam wallet"
        }
    };

    for(let key of Object.keys(eventItems)){
        switch(eventKeyWords[key].type){
            case "onePointObject":
                for(let item of eventItems[key]){
                    timeEvents.push(
                        [
                            item[eventKeyWords[key].date],
                            `${eventKeyWords[key].start} ${item[eventKeyWords[key].value]} ${eventKeyWords[key].end}`,
                            key
                        ]
                    );
                }
                break;
            case "twoPointObject":
                for(let item of eventItems[key]){
                    timeEvents.push(
                        [
                            item[eventKeyWords[key].date],
                            `${eventKeyWords[key].start} ${item[eventKeyWords[key].value2]} ` +
                            `${eventKeyWords[key].mid} ${eventKeyWords[key].value1}` +
                            `${eventKeyWords[key].end} `,
                            key
                        ]
                    );
                }
                break;
            case "list":
                for(let item of eventItems[key]){
                    timeEvents.push(
                        [
                            item[0],
                            `${eventKeyWords[key].start} ${item[1]} ${eventKeyWords[key].end}`,
                            key
                        ]
                    );
                }
        }
    }
    return mergeSort(timeEvents);
};

const mergeSort = (unsortedArray) => {
    // No need to sort the array if the array only has one element or empty
    if (unsortedArray.length <= 1) {
        return unsortedArray;
    }

    // In order to divide the array in half, we need to figure out the middle
    const middle = Math.floor(unsortedArray.length / 2);

    // This is where we will be dividing the array into left and right
    const left = unsortedArray.slice(0, middle);
    const right = unsortedArray.slice(middle);

    // Using recursion to combine the left and right
    return merge(
        mergeSort(left), mergeSort(right)
    );
};

// Merge the two arrays: left and right
const merge = (left, right) => {
    let resultArray = [], leftIndex = 0, rightIndex = 0;

    // We will concatenate values into the resultArray in order
    while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex][0] < right[rightIndex][0]) {
            resultArray.push(left[leftIndex]);
            leftIndex++; // move left array cursor
        } else {
            resultArray.push(right[rightIndex]);
            rightIndex++; // move right array cursor
        }
    }

    // We need to concat here because there will be one element remaining
    // from either left OR the right
    return resultArray
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex));
};

export default mergeEvents;