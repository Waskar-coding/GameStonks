//Standard
import React from 'react';

//Packages
import {Link} from "react-router-dom";
import axios from "axios";

//Local components
import SearchList from "../search/search-list";

//Useful functions
import interactiveDict from "../language-display/interactive-classifier";
import otherDict from "../language-display/other-classifier";
import messageDict from "../language-display/message-classifier";

//Context
import LanguageContext from "../language-context";

//StyleSheets
import "./jackpot-box.css";

//Main class
class WrappedEventSearch extends React.Component{
    /*
        Wraps the event list into the SearchList HOC in order to pass basic
        data to the API through it.
    */
    render(){
        return(
            <SearchList
                defaultSort="end"
                displayPerPage = "2"
                message="jackpot-message"
                placeholder="jackpot-placeholder"
                tooltip="jackpot-tooltip"
                options={JSON.stringify({
                    start: interactiveDict['search-form']['jackpot-start'][this.context],
                    end: interactiveDict['search-form']['jackpot-end'][this.context],
                    active_users: interactiveDict['search-form']['jackpot-users'][this.context],
                    total_value: interactiveDict['search-form']['jackpot-value'][this.context]
                })}
                location={this.props.location}
            >
                <EventSearch />
            </SearchList>
        )
    }
}
WrappedEventSearch.contextType = LanguageContext;


class EventSearch extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: []
        };
        this.updateSearch = this.updateSearch.bind(this);
    }
    updateSearch = () => {
        const page = this.props.page.toString();
        const sort = this.props.sort;
        const order = this.props.order;
        const search = this.props.search;
        const lan = this.context;
        this.setState({
            isLoaded: false
        });
        axios.get(`/jackpots/current?sort=${sort}&order=${order}&search=${search}&page=${page}&language=${lan}`)
            .then(
                (res) => {
                    this.setState({
                        isLoaded: true,
                        items: res.data.current
                    });
                    this.props.toParent(res.data.current_n)
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }
    componentDidMount(){
        this.updateSearch()
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return(
            (this.props.sort !== nextProps.sort)
            ||
            (this.props.order !== nextProps.order)
            ||
            (this.props.search !== nextProps.search)
            ||
            (this.props.page !== nextProps.page)
            ||
            (this.state.isLoaded !== nextState.isLoaded)
        )
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(
            (this.props.sort !== prevProps.sort)
            ||
            (this.props.order !== prevProps.order)
            ||
            (this.props.page !== prevProps.page)
            ||
            (this.props.search !== prevProps.search)
        ){
            this.updateSearch();
        }
    }
    render(){
        if((this.state.error) || (this.state.items === undefined)){
            return(
                <div className="jackpot_list">
                    Couldn't load current jackpots
                </div>);
        }
        else if(this.state.isLoaded === false){
            return(<div><p>Loading ...</p></div>)
        }
        else if(this.state.items.length === 0){
            return(<div>{messageDict['Search']['jackpot-404'][this.context]}</div>)
        }
        else{
            return(
                <div className="jackpot_list">
                    <nav>
                        <ul style={{listStyleType: "none"}}>
                            {this.state.items.map(item => {
                                return (
                                    <li key={item.jackpot_id}>
                                        <Link to={`/events/${item.jackpot_id}`}>
                                            <EventBox
                                                eventId={item.jackpot_id}
                                                eventClass={item.jackpot_class}
                                                eventThumbnail={item.jackpot_thumbnail}
                                                title={item.jackpot_title}
                                                value={item.total_value}
                                                start={item.start.slice(0, 10)}
                                                final={item.final.slice(0, 10)}
                                                status={item.user_status}
                                                sponsor={item.jackpot_entity}
                                            />
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </div>
            )
        }
    }
}
EventSearch.contextType = LanguageContext;

class EventBox extends React.Component{
    render(){
        return(
            <div className="jackpot_box">
                <div className="jackpot_image_outercase">
                    <div className="jackpot_image_innercase">
                        <img src={`data:image/png;base64, ${this.props.eventThumbnail}`} alt="jackpot_icon" width="170" height="170"/>
                    </div>
                </div>
                <div className="jackpot_description_case">
                    <h1 className="jackpot_title">{this.props.title}</h1>
                    <table className="jackpot_description_table">
                        <tbody>
                            <tr>
                                <th style={{textAlign:"left"}}>
                                    <h2>{otherDict['jackpot']['jackpot-class'][this.context]}</h2>
                                </th>
                                <th style={{textAlign:"right"}}>
                                    <h2>{this.props.eventClass}</h2>
                                </th>
                            </tr>
                            <tr>
                                <th style={{textAlign:"left"}}>
                                    <h2>{otherDict['jackpot']['jackpot-sponsor'][this.context]}</h2>
                                </th>
                                <th style={{textAlign:"right"}}>
                                    <h2>{this.props.sponsor}</h2>
                                </th>
                            </tr>
                            <tr>
                                <th style={{textAlign:"left"}}>
                                    <h2>{otherDict['jackpot']['jackpot-start'][this.context]}</h2>
                                </th>
                                <th style={{textAlign:"right"}}>
                                    <h2>{this.props.start}</h2>
                                </th>
                            </tr>
                            <tr>
                                <th style={{textAlign:"left"}}>
                                    <h2>{otherDict['jackpot']['jackpot-final'][this.context]}</h2>
                                </th>
                                <th style={{textAlign:"right"}}>
                                    <h2>{this.props.final}</h2>
                                </th>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="jackpot_value_case">
                    <h1>{this.props.value}$</h1>
                </div>
                <div className="jackpot_status_case">
                    <div className={this.props.status}>
                        {otherDict['jackpot'][this.props.status][this.context]}
                    </div>
                </div>
            </div>
        )
    }
}
EventBox.contextType = LanguageContext;

export default WrappedEventSearch;