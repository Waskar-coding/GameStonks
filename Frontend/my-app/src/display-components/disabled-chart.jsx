//Standard
import React from "react";

//Main class
const DisabledChart = ({disabledMessage, children}) => {
    return(
        <div style={{backgroundColor: "rgba(0,0,0,0.5)", position:"relative"}}>
            <div style={{color: "white", position:"absolute", top: "50%", left: "50%"}}>
                {disabledMessage}
            </div>
            <div>
                {children}
            </div>
        </div>
    )

}
export default DisabledChart;