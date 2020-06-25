import React from "react";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#root");

class Bronze extends React.Component{
    constructor(){
        super();
        this.state = {
            display: false,
            displayError: false,
            isLoaded: false,
            newShare: 0,
            errorMessage: null
        };
        this.closeModal = this.closeModal.bind(this);
    }
    closeModal(){
        this.setState({
            display: false,
            displayError: false
        })
    }
    componentDidMount() {
        const postForm = {
            multiplier: this.props.multiplierId,
            multiplier_class: this.props.multiplierClass
        };
        axios.post('./multiplier',postForm)
            .then(res => {
                if(res.data.user){
                    this.setState({
                        isLoaded: true,
                        display: true,
                        newShare: res.data.new_share
                    });
                    this.props.toParent(res.data.user);
                }
                else{
                    this.setState({
                        isLoaded: true,
                        displayError: true,
                        errorMessage: res.data.message
                    });
                }

            })
            .catch(err => {
                this.setState({
                    isLoaded: true,
                    newShare: 'Bruh'
                });
            })
    }
    render(){
        if(this.state.isLoaded === false){
            return(<div></div>)
        }
        else{
            return(
                <Modal isOpen={this.state.displayError}>
                    <div>{this.state.errorMessage}}</div>
                    <button onClick={() => {this.closeModal()}} >Close</button>
                </Modal>
            )
        }
    }
}

export default Bronze;