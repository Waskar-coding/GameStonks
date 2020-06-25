import React from "react";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement("#root");

class Handshake extends React.Component{
    constructor(){
        super();
        this.state = {
            isLoaded: false,
            display: false,
            displayError: false,
            friendName: "",
            errorMessage: null
        };
        this.closeModal = this.closeModal.bind(this);
        this.handleParamChange = this.handleParamChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount() {
        this.setState({isLoaded: true, display: true})
    }
    closeModal(){
        this.setState({display: false, displayError: false})
    }
    handleParamChange(event){
        this.setState({friendName: event.target.value})
    }
    handleSubmit(event){
        event.preventDefault();
        const postForm = {
            multiplier: this.props.multiplierId,
            multiplier_class: this.props.multiplierClass,
            friendName: this.state.friendName
        };
        axios.post('./multiplier',postForm)
            .then(res => {
                if(res.data.user){
                    this.setState({
                        display: false
                    });
                    this.props.toParent(res.data.user)
                }
                else{
                    this.setState({
                        display: false,
                        displayError: true,
                        errorMessage: res.data.message
                    })
                }
            })
    }
    render(){
        if(this.state.isLoaded === false){
            return(
                <div></div>
            )
        }
        else if(this.state.display === true){
            return(
                <Modal isOpen={this.state.display}>
                    <form onSubmit={this.handleSubmit}>
                        <label for id="search">Write the name friend you want to invite into the event </label>
                        <input
                            type="text"
                            id="search"
                            value={this.state.friendName}
                            onChange={this.handleParamChange}
                            placeholder={"Type the name of your friend"}
                        />
                        <input type="submit" value="Submit" />
                    </form>
                    <button onClick={() => {this.closeModal()}} >Close</button>
                </Modal>
            )
        }
        else{
            return(
                <Modal isOpen={this.state.displayError}>
                    <p>{this.state.errorMessage}</p>
                    <button onClick={() => {this.closeModal()}} >Close</button>
                </Modal>
            )
        }
    }
}

export default Handshake;