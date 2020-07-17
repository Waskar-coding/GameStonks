//Standard
import React from "react";

//Packages
import axios from "axios";
import Modal from "react-modal";

//Local components
import SearchList from "../../search/search-list"
import GameBox from "./J01_GameBox";

//Language jsons
import messageDict from "../../language-display/message-classifier";
import interactiveDict from "../../language-display/interactive-classifier";

//Context
import LanguageContext from "../../language-context";

//Wrapped main class
class WrappedJ01Features extends React.Component{
    render(){
        return(
            <SearchList
                defaultSort="name"
                displayPerPage = "2"
                message="j01-message"
                placeholder="j01-placeholder"
                tooltip="j01-tooltip"
                options={JSON.stringify({
                    name: interactiveDict['search-form']['j01-name'][this.context],
                    release: interactiveDict['search-form']['j01-release'][this.context]
                })}
                location={this.props.location}
            >
                <J01Features eventId={this.props.eventId} />
            </SearchList>
        )
    }
}
WrappedJ01Features.contextType = LanguageContext;

class J01Features extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            currentNumber: 0
        }
        this.updateSearch = this.updateSearch.bind(this);
    }
    updateSearch = () => {
        this.setState({
            isLoaded: false
        });
        axios.get(`/games/${this.props.eventId}/find?sort=${this.props.sort}&order=${this.props.order}&search=${this.props.search}&page=${this.props.page}`)
            .then(res => {
                this.setState({
                    isLoaded: true,
                    items: res.data.profiles,
                    currentNumber: res.data.count,
                    my_name: res.data.my_name
                });
                this.props.toParent(res.data.count);
            })
            .catch(err => {
                this.setState({
                    isLoaded: true,
                    error: err
                });
            })
    }
}


export default WrappedJ01Features;