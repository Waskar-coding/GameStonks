//Standard
import React, {useContext, useState} from "react";

//Packages
import axios from "axios";

//Local components
import ModalConfirm from "../modals/modal-confirm";
import DefaultAPIPost from "../api-interaction/default-api-post";
import DefaultError from "../error-components/default-error";
import DefaultErrorModal from "../error-components/default-error-modal";
import Transaction from "../display-components/transaction";

//Useful functions
import configMoneyDisplay from "../data-manipulation/config-money-display";
import processMessage from "../language-display/process-message";
import multiplierUpdate from "./multiplier-update";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";
import messageDict from "../language-display/message-classifier.json";

//Context
import FunctionContext from "../context/function-context";
import LanguageContext from "../context/language-context";
import MultiplierContext from "../context/multiplier-context";

//Main function
const MultiplierHandshake = ({multiplier}) => {
    const language = useContext(LanguageContext);
    const multiplierContext = useContext(MultiplierContext);
    const {eventId, userName, userThumbnail} = multiplierContext;
    const myBasic = {userName: userName, userThumbnail: userThumbnail};
    const closeFunction = useContext(FunctionContext);
    const [userId, setUserId] = useState("");
    const [userBasic, setUserBasic] = useState({});
    const [handshakeDisplay, setHandshakeDisplay] = useState(100);
    switch(handshakeDisplay){
        case 100:
            return (
                <ModalConfirm
                    confirmMessage={interactiveDict['handshake-event-form']['confirm-search'][language]}
                    cancelMessage={interactiveDict['handshake-event-form']['cancel-search'][language]}
                    toParentConfirm={() => {
                        axios.get(`/users/profiles/${userId}/basic`)
                            .then(res => {
                                setUserBasic({userName: res.data.userName, userThumbnail: res.data.userThumbnail});
                                setHandshakeDisplay(200);
                            })
                            .catch(err => {setHandshakeDisplay(err.response.status)})
                    }}
                    toParentCancel={() => {closeFunction(0)}}
                >
                    <p>{messageDict['confirmation']['handshake-search'][language]}</p>
                    <form>
                        <input
                            type="text" id="donation" value={userId}
                            onChange={(event) => setUserId(event.target.value)}
                            placeholder={interactiveDict['handshake-event-form']['placeholder-search'][language]}
                        />
                    </form>
                </ModalConfirm>
            )
        case 200:
            const requestBody = {
                userId: userId, multiplier: multiplier, eventId: eventId, multiplierClass: "handshake",
                dateParams:{}, isPersonal: true
            }
            return(
                <DefaultAPIPost
                    confirm={() => {
                        const confirmMessage= processMessage(
                            language, ["confirmation","handshake-confirm", userBasic.userName, eventId]
                        );
                        return <Transaction myBasic={myBasic} userBasic={userBasic} message={confirmMessage} />
                    }}
                    success={apiData => {
                        const shareTimetable = apiData.eventRegister.share_timetable;
                        const share = configMoneyDisplay(shareTimetable[shareTimetable.length-1][1]);
                        const successMessage= processMessage(language, ["success", "handshake-success", share]);
                        return <Transaction myBasic={myBasic} userBasic={userBasic} message={successMessage} />
                    }}
                    error={apiStatus => {return(
                        <DefaultError
                            apiStatus={apiStatus} errorDict={
                                {500: "handshake-500", 403: "handshake-403", 404: "handshake-404"}
                            }
                        />
                    )}}
                    url={`/events/${eventId}/multiplier`} requestBody={requestBody}
                    loadMessage="multiplier" toParentClose={() => {closeFunction(0)}}
                    confirmButton={interactiveDict["confirm-modal"]["handshake"][language]}
                    updateFunction={apiData => {multiplierUpdate(apiData, multiplier, multiplierContext)}}
                />
            )
        default:
            return(
                <DefaultErrorModal
                    apiStatus={handshakeDisplay} errorDict={{500: 'handshake-500', 404: 'handshake-404'}}
                />
            )
    }

}
export default MultiplierHandshake;