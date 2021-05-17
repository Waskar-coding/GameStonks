//Standard
import {useContext, useEffect} from "react";

//Context
import {CurrentItems} from "../context/search-context";

//Main function
const SendItemNumber = ({itemNumber}) => {
    const {currentItems, setCurrentItems} = useContext(CurrentItems);
    useEffect(() => {if (currentItems !== itemNumber) {setCurrentItems(itemNumber)}});
    return null;
}
export default SendItemNumber;