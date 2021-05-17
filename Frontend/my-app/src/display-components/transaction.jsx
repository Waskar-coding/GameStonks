//Standard
import React from "react";

//Main function
const Transaction = ({myBasic, userBasic, message}) => {
    return(
        <div style={{display: "flex"}}>
            <div style={{flex: "50%"}}>
                <div><img src={myBasic.userThumbnail} alt="user_thumbnail" /></div>
                <div>{myBasic.userName}</div>
            </div>
            <div style={{flex: "50%"}}>
                <div><img src={userBasic.userThumbnail} alt="user_thumbnail" /></div>
                <div>{userBasic.userName}</div>
            </div>
            { message && <div>{message}</div> }
        </div>
    )
}
export default Transaction;