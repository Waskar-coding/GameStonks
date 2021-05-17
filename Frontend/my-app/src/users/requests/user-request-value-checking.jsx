//Standard
import React, {useContext} from "react";

//Local components
import DefaultAPIPost from "../../api-interaction/default-api-post";
import DefaultError from "../../error-components/default-error";
import Transaction from "../../display-components/transaction";

//Useful functions
import processMessage from "../../language-display/process-message";

//Language json
import interactiveDict from "../../language-display/interactive-classifier.json";

//Context
import LanguageContext from "../../context/language-context";
import TransactionContext from "../../context/transaction-context";

//Main function
const UserRequestValueChecking = ({request, display, setDisplay}) => {
    const language = useContext(LanguageContext);
    const requestContext = useContext(TransactionContext);
    const myBasic = {
        userId: requestContext.userId, userName: requestContext.userName, userThumbnail: requestContext.userThumbnail
    };
    if(display === 0){return null}
    else{
        return(
            <DefaultAPIPost
                confirm={() => {
                    const confirmMessage= processMessage(
                        language, ["confirmation","request-confirm", request, "Steam"]
                    );
                    return <Transaction myBasic={myBasic} userBasic={myBasic} message={confirmMessage} />
                }}
                success={apiData => {
                    const successMessage= processMessage(
                        language, ["success", "request-success", request, "Steam"]
                    );
                    return <Transaction myBasic={myBasic} userBasic={myBasic} message={successMessage} />
                }}
                error={apiStatus => {return(
                    <DefaultError
                        apiStatus={apiStatus} errorDict={{500: "request-500", 403: "request-cash"}}
                    />
                )}}
                url="/users/request"
                requestBody={{
                    userId: requestContext.userId, cashOut: request,
                    dateParams: {
                        listStart: requestContext.list.startDate, listFinal: requestContext.list.finalDate,
                        graphStart: requestContext.graph.startDate, graphFinal: requestContext.graph.finalDate
                    }
                }}
                loadMessage="transaction-apply" toParentClose={() => {setDisplay(0)}}
                confirmButton={interactiveDict["confirm-modal"]["request"][language]}
                updateFunction={(apiData) => {
                    requestContext.setProfile({
                        ...requestContext.profile, wealth: apiData.wealth,
                        requests: [...requestContext.profile.requests, {
                            request_date: new Date().toISOString(), request_cash: request, request_type: 'Steam'
                        }]
                    })
                    requestContext.setList({...requestContext.list, timeline: apiData.listNewActions})
                    requestContext.setGraph({
                        ...requestContext.graph, timeline: apiData.graphNewActions, wealthPoints: apiData.graphNewPoints
                    });
                }}
            />
        )
    }
}
export default UserRequestValueChecking;