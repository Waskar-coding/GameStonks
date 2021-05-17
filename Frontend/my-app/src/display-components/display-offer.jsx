//Standard
import React from "react";

//Local components
import Transaction from "./transaction";

//Main function
const DisplayOffer = ({
    leftBasic, rightBasic,
    leftType, rightType,
    leftValue, rightValue,
    message, offerDate
}) => {
    /*
    Combines the transaction component with
    the items that each party is trading
    */
    return(
        <div>
            <Transaction
                myBasic={leftBasic}
                userBasic={rightBasic}
                message={message}
            />
            <div>{offerDate}</div>
            <div style={{display: "flex"}}>
                <div style={{flex: "50%"}}>
                    <div>{leftType}</div>
                    <div>{leftValue}</div>
                </div>
                <div style={{flex: "50%"}}>
                    <div>{rightType}</div>
                    <div>{rightValue}</div>
                </div>
            </div>
        </div>
    )
}
export default DisplayOffer;