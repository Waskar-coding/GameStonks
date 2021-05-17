//Standard
import React, {useContext} from "react";

//Local components
import DefaultAPIGet from "../../api-interaction/default-api-get";
import DefaultAPIPost from "../../api-interaction/default-api-post";
import DefaultError from "../../error-components/default-error";
import DefaultErrorModal from "../../error-components/default-error-modal";
import LoadModal from "../../load-components/load-modal";
import Transaction from "../../display-components/transaction";

//Useful functions
import processMessage from "../../language-display/process-message";

//Language jsons
import interactiveDict from "../../language-display/interactive-classifier.json";

//Context
import FunctionContext from "../../context/function-context";
import LanguageContext from "../../context/language-context";
import TransactionContext from "../../context/transaction-context";

//Wrapped main function
const HandshakeChecking = ({eventId, multiplier, display}) => {
    if(display === 0){return null}
    else{
        return(
            <DefaultAPIGet
                LoadComponent={LoadModal} ErrorComponent={DefaultErrorModal}
                url={`/users/my_basic`} loadMessage="transaction-confirm"
                errorDict={{500:"transaction-confirm-500",404:"transaction-confirm-404"}}
                render={(apiStatus,newState) => {
                    return <HandshakeConfirm user={newState} eventId={eventId} multiplier={multiplier}/>
                }}
            />
        )
    }
}
export default HandshakeChecking;

//Inner main function
const HandshakeConfirm = ({user, eventId, multiplier}) => {
    const language = useContext(LanguageContext);
    const setDisplay = useContext(FunctionContext);
    const handshakeContext = useContext(TransactionContext);
    const {userId, userName, userThumbnail} = handshakeContext;
    const friendBasicProfile = {userId: userId, userName: userName, userThumbnail: userThumbnail};
    const requestBody = {
        userId: userId, multiplier: multiplier, eventId: eventId, multiplierClass: "handshake",
        dateParams:{listStart: handshakeContext.list.startDate, listFinal: handshakeContext.list.finalDate},
        isPersonal: handshakeContext.isPersonal
    };
    return(
        <DefaultAPIPost
            confirm={() => {
                const confirmMessage= processMessage(
                    language, ["confirmation","handshake-confirm", userName, eventId]
                );
                return <Transaction myBasic={user} userBasic={friendBasicProfile} message={confirmMessage} />
            }}
            success={apiData => {
                let [shareDollar, shareCents] = apiData.newShare[1].toString().split('.');
                while(shareCents.length < 2){shareCents = shareCents + '0'}
                const successMessage= processMessage(
                    language, ["success", "handshake-success", `${shareDollar}.${shareCents.slice(0,2)}`]
                );
                return <Transaction myBasic={user} userBasic={friendBasicProfile} message={successMessage} />
            }}
            error={apiStatus => {return(
                <DefaultError
                    apiStatus={apiStatus} errorDict={{500: "handshake-500", 403: "handshake-403", 400: "handshake-400"}}
                />
            )}}
            url={`/events/${eventId}/multiplier`} requestBody={requestBody} toParentClose={() => {setDisplay(0)}}
            loadMessage="multiplier" confirmButton={interactiveDict["confirm-modal"]["handshake"][language]}
            updateFunction={(apiData) => {
                const {setProfile, setList, setHandshake, profile, list, handshake} = handshakeContext;
                const newEvents = profile.events.includes(eventId)?  profile.events : [...profile.events, eventId];
                setProfile({...profile, eventNumber: newEvents.length, events: newEvents});
                setList({...list, timeline: apiData.listTimeline});
                setHandshake({...handshake, multipliers: handshake.multipliers.filter(handshakeMultiplier => {
                    return handshakeMultiplier !== multiplier
                })})
            }}
        />
    )
}