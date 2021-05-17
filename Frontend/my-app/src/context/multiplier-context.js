//Standard
import React from "react";

//Main function
const MultiplierContext = React.createContext({
    eventId: "", userName: "", userThumbnail: "", setRegister: () => {},
    available: [], setAvailable: () => {}, used: [], setUsed: () => {}
});
export default MultiplierContext;