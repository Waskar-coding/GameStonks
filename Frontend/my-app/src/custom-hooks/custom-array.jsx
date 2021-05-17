//Standard
import {useReducer} from "react";

//Array reducer
const arrayReducer = (state, action) => {
    switch (action.type) {
        case "push": return [...state, action.data]
        case "pull": state.slice(0, state.length-2); return state
        case "insert": state.splice(action.index, 0, action.data); return state
        case "update": state[action.index] = action.value; return state
        case "deleteIndex": state.splice(action.index, 1); return state
        case "deleteValue":
            const valueIndex = state.indexOf(action.value);
            if(valueIndex === -1) return state;
            state.splice(valueIndex,1); return state;
        default: return state
    }
}

//Main function
const useArray = (initialArray) => {
    const [array, setArray] = useReducer(arrayReducer, initialArray);
    return [array, setArray]
}
export default useArray;