//Standard
import React, {useContext, useEffect, useState, lazy} from "react";

//Packages
import axios from "axios";

//Local components
import DefaultAPIGet from "../api-interaction/default-api-get";
import DefaultLoad from "../load-components/default-load";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";

//Context
import BasicProfileContext from "../context/profile-basic-context";
import LanguageContext from "../context/language-context";

//Dynamic local components
const ModalConfirm = lazy(() => import('../modals/modal-confirm'));
const ModalMessage = lazy(() => import('../modals/modal-message'));
const NotificationHandler =  lazy(() => import("../notifications/notification-handler"));
const WrappedDoc = lazy(() => import('../docs/doc-default'));

//Main function
const AuthCase = ({children}) => {
    const language = useContext(LanguageContext);
    const [userAlert, setUserAlert] = useState({alertStatus: '', alertData: {}});
    const [register, setRegister] = useState({showModal: false, privacy: false});
    useEffect(() => {
        axios.get('/users/check_alerts')
            .then(res => {
                if(res.data.notify_type){
                    setUserAlert({alertStatus: res.data.notify_type, alertData: res.data.notify_data})
                }
            })
            .catch(() => {})
    }, []);
    return (
        <React.Fragment>
            {userAlert.alertStatus !== '' &&
                <React.Suspense fallback={null}>
                    <ModalMessage
                        toParent={() => setUserAlert({alertStatus: '', alertData: {}})}
                        message={interactiveDict['message-modal']['close'][language]}
                    >
                        <WrappedDoc docType="modal" match={{params: {docName: userAlert.alertStatus}}} />
                        {Object.entries(userAlert.alertData).length !== 0 &&
                            <NotificationHandler alertStatus={userAlert.alertStatus} alertData={userAlert.alertData} />
                        }
                    </ModalMessage>
                </React.Suspense>
            }
            {register.showModal === true &&
                <React.Suspense fallback={null}>
                    <ModalConfirm
                        toParentConfirm={() => window.location = 'http://localhost:8080/steam_auth/register'}
                        toParentCancel={() => setRegister({showModal: false, privacy: false})}
                        confirmMessage={interactiveDict['auth-case']['register-confirm'][language]}
                        cancelMessage={interactiveDict['message-modal']['close'][language]}
                        confirmCondition={register.showModal === true && register.privacy === true}
                    >
                        <WrappedDoc docType="modal" match={{params: {docName: "register-confirm"}}} />
                        <div>
                            <input
                                type="checkbox"
                                id="confirm-privacy"
                                name="confirm-privacy"
                                onChange={() => {
                                    if(register.privacy === false){setRegister({...register, privacy: true})}
                                    else{setRegister({...register, privacy: false})}
                                }}
                            />
                            {interactiveDict['auth-case']['register-conditions'][language]}
                        </div>
                    </ModalConfirm>
                </React.Suspense>
            }
            <DefaultAPIGet
                LoadComponent={DefaultLoad}
                loadMessage='auth-case'
                ErrorComponent={() => {
                    return(
                        <div>
                            <div>
                                <button onClick={() => window.location = 'http://localhost:8080/steam_auth/login'}>
                                    {interactiveDict['auth-case']['login'][language]}
                                </button>
                                <button onClick={() => setRegister({...register, showModal: true})}>
                                    {interactiveDict['auth-case']['register'][language]}
                                </button>
                            </div>
                            <BasicProfileContext.Provider
                                value={{isAuth: false}}
                                children={children}
                            />
                        </div>
                    )
                }}
                errorDict={{}}
                url="/users/my_basic"
                render={(apiStatus, apiData) => {
                    const logout = () => {
                        axios({method: 'get', url: '/steam_auth/logout', baseUrl: 'https://localhost:8080'})
                        .then(() => window.location = 'http://localhost:3000/users/find')
                        .catch(err => console.log(err))
                    };
                    return(
                        <div>
                            <div>
                                <img src={apiData.userThumbnail} alt="user_thumbnail" />
                                {apiData.userName}
                                <button onClick={() => window.location = 'http://localhost:3000/users/my_profile'}>
                                    {interactiveDict['auth-case']['profile'][language]}
                                </button>
                                <button onClick={() => logout()}>
                                    {interactiveDict['auth-case']['logout'][language]}
                                </button>
                            </div>
                            <BasicProfileContext.Provider
                                value={{
                                    isAuth: true,
                                    ...apiData
                                }}
                                children={children}
                            />
                        </div>
                    )
                }}
            />
        </React.Fragment>
    )
}
export default AuthCase;