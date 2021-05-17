//Standard
import React, {lazy, useContext, useState} from "react";

//Language jsons
import interactiveDict from '../../language-display/interactive-classifier.json';

//Context
import LanguageContext from "../../context/language-context";

//Dynamic local components
const DefaultAPIPost = lazy(() => import('../../api-interaction/default-api-post'));
const WrappedDoc = lazy(() => import('../../docs/doc-default'));

//Main function
const DeleteUser = () => {
    const language = useContext(LanguageContext);
    const [deleteDisplay, setDeleteDisplay] = useState(0);
    return (
        <div>
            <button onClick={() => setDeleteDisplay(1)}>
                {interactiveDict['user-delete']['delete-button'][language]}
            </button>
            {deleteDisplay !== 0 &&
                <DefaultAPIPost
                    confirm={() => <WrappedDoc docType="modal" match={{params: {docName: 'delete-confirm'}}} />}
                    success={() => {window.location = 'http://localhost:3000/users/find'}}
                    error={() => <WrappedDoc docType="modal" match={{params: {docName: 'delete-500'}}} />}
                    url="/steam_auth/delete"
                    requestBody={{}}
                    loadMessage="default"
                    toParentClose={() => setDeleteDisplay(0)}
                    confirmButton={interactiveDict['user-delete']['delete-confirm'][language]}
                    updateFunction={() => {}}
                    method="delete"
                />
            }
        </div>
    )
}
export default DeleteUser;