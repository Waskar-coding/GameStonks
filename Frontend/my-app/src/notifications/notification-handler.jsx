//Standard
import React, {lazy, Suspense} from "react";

//Main function
const NotificationHandler = ({alertStatus, alertData}) => {
    const SPECIAL_NOTIFICATIONS = ['B02', 'strike'];
    const NotificationComponent = lazy(() => import(
        `./notification-${SPECIAL_NOTIFICATIONS.includes(alertStatus)? `special-${alertStatus}` : 'message'}`)
    );
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <NotificationComponent alertData={alertData} />
        </Suspense>
    )
}
export default NotificationHandler;