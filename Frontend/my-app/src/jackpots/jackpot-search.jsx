//Standard
import React from 'react';

//Packages
import {Link} from "react-router-dom";

//Local components
import Search from "../search/search-main";

//Useful functions
import interactiveDict from "../language-display/interactive-classifier";
import otherDict from "../language-display/other-classifier";
import messageDict from "../language-display/message-classifier";

//Context
import LanguageContext from "../language-context";

//StyleSheets
import "./jackpot-box.css";

class Jackpots extends React.Component{
    render(){
        return(
            <Search
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
                <JackpotSearch />
            </Search>
        )
    }
}
Jackpots.contextType = LanguageContext;


class JackpotSearch extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoad: false,
            items: []
        };
    }
    componentDidMount(){
        const page = this.props.page.toString();
        const sort = this.props.sort;
        const order = this.props.order;
        const search = this.props.search;
        const lan = this.context;
        const fetchURL = `/jackpots/current?sort=${sort}&order=${order}&search=${search}&page=${page}&language=${lan}`;
        fetch(fetchURL)
            .then(res => res.json())
            .then(
                (res) => {
                    console.log(res);
                    this.setState({
                        isLoad: true,
                        items: res.current
                    });
                    this.props.toParent(res.current_n, res.total_n)
                },
                (error) => {
                    this.setState({
                        isLoad: true,
                        error
                    });
                }
            )
    }
    render(){
        if((this.state.error) || (this.state.items===undefined)){
            return(
                <div className="jackpot_list">
                    Couldn't load current jackpots
                </div>);
        }
        else if(this.state.isLoad === false){
            return(<div><p>Loading ...</p></div>)
        }
        else if(this.state.items.length === 0){
            return(<div>{messageDict['Search']['jackpot-404'][this.context]}</div>)
        }
        else{
            return(
                <div className="jackpot_list">
                    <ul style={{listStyleType: "none"}}>
                        {this.state.items.map(item => (
                            <li key={item.jackpot_id}>
                                <Link to={`/events/${item.jackpot_id}`}>
                                    <JackpotBox
                                        jackpotId={item.jackpot_id}
                                        jackpotClass={item.jackpot_class}
                                        title={item.jackpot_title}
                                        value={item.total_value}
                                        start={item.start.slice(0, 10)}
                                        final={item.end.slice(0, 10)}
                                        status={item.user_status}
                                        sponsor={item.jackpot_entity}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )
        }
    }
}
JackpotSearch.contextType = LanguageContext;

class JackpotBox extends React.Component{
    iconPath = () => {
        if(this.props.jackpotClass !== "special"){
            return `./jackpot_icons/${this.props.jackpotClass}.jpg`
        }
        else{
            return `./jackpot_icons/${this.props.jackpotId}.jpg`
        }
    };

    render(){
        return(
            <div className="jackpot_box">
                <div className="jackpot_image_outercase">
                    <div className="jackpot_image_innercase">
                        <img src={require(`${this.iconPath()}`)} alt="jackpot_icon" width="170" height="170"/>
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
                                    <h2>{this.props.jackpotClass}</h2>
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
JackpotBox.contextType = LanguageContext;

export default Jackpots;