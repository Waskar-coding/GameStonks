//Standard
import React, {Suspense} from "react";

//Local components
import DefaultLoad from "../load-components/default-load";

//Main function
const MultiplierRouter = ({multiplier, multiplierClass, display}) => {
    if(display === 0){return null}
    else{
        const MultiplierComponent = React.lazy(() => import(`./multiplier-${multiplierClass}`));
        return(
            <Suspense fallback={<DefaultLoad loadMessage={'multiplier-router'} />}>
                <MultiplierComponent multiplier={multiplier} />
            </Suspense>
        )
    }

}
export default MultiplierRouter;