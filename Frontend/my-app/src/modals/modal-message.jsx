//Standard
import React from "react";

//Packages
import Modal from "react-modal";

//Main function
const ModalMessage = ({toParent, message, children}) => {
    return (
        <Modal isOpen={true}>
            {children}
            <button onClick={() =>{return toParent()}}>{message}</button>
        </Modal>
    )
}
export default ModalMessage;