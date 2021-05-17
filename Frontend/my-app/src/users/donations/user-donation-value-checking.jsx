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
import BasicProfileContext from "../../context/profile-basic-context";
import FunctionContext from "../../context/function-context";
import LanguageContext from "../../context/language-context";
import TransactionContext from "../../context/transaction-context";

//Main function
const WrappedDonationConfirm = ({donation, display}) => {
    const {userId, userName, userThumbnail} = useContext(TransactionContext);
    switch (display) {
        case 100:
            return(
               <DefaultAPIGet
                   LoadComponent={LoadModal} ErrorComponent={DefaultErrorModal}
                   url={`/users/profiles/${donation.steamId}/basic`} loadMessage="transaction-confirm"
                   errorDict={{500:"transaction-confirm-500",404:"transaction-confirm-404"}}
                   render={(apiStatus,receiver) => {return <DonationConfirm donation={donation} receiver={receiver} />}}
               />
            )
        case 200:
            const receiver = {userId: userId, userName: userName, userThumbnail: userThumbnail};
            return <DonationConfirm donation={donation}  receiver={receiver} />
        default: return null
    }
}
export default WrappedDonationConfirm;


const DonationConfirm = ({donation, receiver}) => {
    const language = useContext(LanguageContext);
    const closeModal = useContext(FunctionContext);

    const donor = useContext(BasicProfileContext);
    const {donationValue} = donation;
    const {isPersonal, list, graph, setProfile, profile, setList, setGraph} = useContext(TransactionContext);

    const requestBody = {
        myId: donor.userId, userId: receiver.userId, transferredWealth: Number(donationValue),
        dateParams:{
            listStart: list.startDate, listFinal: list.finalDate,
            graphStart: isPersonal? graph.startDate : null,
            graphFinal: isPersonal? graph.finalDate : null
        },
        isPersonal: isPersonal
    };
    return(
        <DefaultAPIPost
            confirm={() => {
                const confirmMessage= processMessage(
                    language, ["confirmation","donation-confirm", donationValue, receiver.userName]
                );
                return <Transaction myBasic={donor} userBasic={receiver} message={confirmMessage} />
            }}
            success={apiData => {
                const wealth = isPersonal? apiData.wealth : apiData.myWealth;
                let [wealthDollars, wealthCents] = wealth.toString().includes('.')?
                    wealth.toString().split('.') : [wealth.toString(), ''];
                while(wealthCents.length < 2){wealthCents = wealthCents + '0'}
                const successMessage= processMessage(
                    language, [
                        "success", "donation-success", donationValue,
                        receiver.userName, `${wealthDollars}.${wealthCents.slice(0,2)}`
                    ]
                );
                return <Transaction myBasic={donor} userBasic={receiver} message={successMessage} />
            }}
            error={apiStatus => {return(
                <DefaultError
                    apiStatus={apiStatus} errorDict={{500: "donation-confirm-500", 403: "donation-confirm-403"}}
                />
            )}}
            url="/users/donate" requestBody={requestBody}
            loadMessage="transaction-apply" toParentClose={() => {closeModal()}}
            confirmButton={interactiveDict["confirm-modal"]["confirm"][language]}
            updateFunction={(apiData) => {
                setProfile({...profile, wealth: apiData.wealth})
                setList({...list, timeline: apiData.listNewActions})
                isPersonal && setGraph(
                    {...graph, timeline: apiData.graphNewActions, wealthPoints: apiData.graphNewPoints}
                );
            }}
        />
    )
}