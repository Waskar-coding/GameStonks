//Standard
import React, {useContext} from "react";

//Context
import EventIdContext from "../../../context/event-id-context";

//Main function
const DefaultPersonalUnpacking = ({state, children}) => {
    return (
        React.cloneElement(children, {
            eventId: useContext(EventIdContext), name: state.name, thumbnail: state.thumbnail,
            maxMultipliers: state.max_multipliers, availableMultipliers: state.multipliers,
            userRegister: state.register, products: state.products,
        })
    )
}
export default DefaultPersonalUnpacking;