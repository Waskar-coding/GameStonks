//Standard
import React from "react";

//Main function
const DefaultPersonalUnpacking = ({eventId, state, children}) => {
    return (
        React.cloneElement(children, {
            eventId: eventId,
            name: state.name,
            thumbnail: state.thumbnail,
            availableMultipliers: state.multipliers,
            register: state.register,
            products: state.products
        })
    )
}
export default DefaultPersonalUnpacking;