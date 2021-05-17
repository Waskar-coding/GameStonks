//Standard
import React, {useRef} from "react";

//Packages
import Modal from "react-modal";

//Main function
const ModalConfirm = ({toParentConfirm, toParentCancel, confirmMessage, cancelMessage, confirmCondition, children}) => {
    const confirmButton = useRef();
    return (
        <Modal isOpen={true}>
            {children}
            <button
                ref={confirmButton}
                disabled={confirmCondition === false}
                onClick={() => {
                    confirmButton.current.setAttribute('disabled', true);
                    return toParentConfirm();
                }}
            >
                {confirmMessage}
            </button>
            <button onClick={() =>{return toParentCancel()}}>{cancelMessage}</button>
        </Modal>
    )
}
export default ModalConfirm;