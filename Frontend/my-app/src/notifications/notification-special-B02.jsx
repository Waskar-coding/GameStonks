//Standard
import React from "react";

//Local components
import EventTimer from "../display-components/event-timer";
import NotificationMessage from "./notification-message";

//Main function
const NotificationB02 = ({alertData}) => {
    console.log(alertData.register.ban_end);
    return (
        <div>
            <NotificationMessage alertData={alertData} />
            <EventTimer limitDate={new Date(alertData.register.ban_end)} />
        </div>
    )
}
export default NotificationB02;