import React from 'react';
import Math from 'math';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import queryString from "query-string";
import JackpotBox from "./JackpotBox";
import PageList from "../pagination/PageList";
import SearchForm from "../search/search-form";
import findMaxPage from "../pagination/MaxPage";

const JackpotListOptions = {
    start: 'Starting date',
    end: 'Ending date',
    active_users: 'Active players',
    total_value: 'Jackpot value'
};

class Jackpots extends React.Component{
    constructor(props) {
        super(props);
        if(this.props.location.search!=="") {
            const query = queryString.parse(this.props.location.search);
            if (
                (query.page !== undefined)
                && (query.sort !== undefined)
                && (query.order !== undefined)
                && (query.search !== undefined)
            ) {
                this.state = {
                    error: null,
                    sort: query.sort,
                    order: query.order,
                    search: query.search,
                    page: query.page,
                    current_number: 1,
                };
            } else {
                this.state = {
                    error: null,
                    sort: 'start',
                    order: '1',
                    search: "",
                    page: 1,
                    current_number: 1,
                };
            }
        }
        else{
            this.state={
                error: null,
                sort: 'start',
                order: '1',
                search: "",
                page: 1,
                current_number: 1,
            };
        }
        this.callbackPage = this.callbackPage.bind(this);
        this.callbackSearch = this.callbackSearch.bind(this);
        this.callbackLoad = this.callbackLoad.bind(this);
    }
    callbackPage(page){
        window.location = (`./current?sort=${this.state.sort}&order=${this.state.order}&page=${page}&search=${this.state.search}`)
    }
    callbackSearch(sort, order, search){
        window.location = (`./current?sort=${sort}&order=${order}&page=1&search=${search}`)
    }
    callbackLoad(current_n){
        this.setState({
           current_number: current_n
        });
    }
    render(){
        const currentJackpots = (this.state.current_number!==undefined)? this.state.current_number: 0;
        return(
            <div>
                <SearchForm
                    message={`${currentJackpots} currently active jackpots`}
                    options={JSON.stringify(JackpotListOptions)}
                    toParent={this.callbackSearch}
                    sort={this.state.sort}
                    order={this.state.order}
                    search={this.state.search}
                    placeholder="Search for a jackpot"
                    />
                <JackpotList
                    page={this.state.page}
                    sort={this.state.sort}
                    order={this.state.order}
                    search={this.state.search}
                    toParent={this.callbackLoad}
                    />
                <PageList
                    current={this.state.page}
                    toParent={this.callbackPage}
                    maxpage={findMaxPage(this.state.current_number, 2).toString()}
                    />
            </div>
        )
    }
}

class JackpotList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            total_number: 0,
            current_number: 0
        };
        const page = props.page.toString();
        const sort = props.sort;
        const order = props.order;
        const search = props.search;
        const fetchURL = `?sort=${sort}&order=${order}&search=${search}&page=${page}`;
        fetch(fetchURL)
            .then(res => res.json())
            .then(
                (res) => {
                    this.setState({
                        isLoaded: true,
                        items: res.current,
                        total_number: res.total_n,
                        current_number: res.current_n
                    });
                    this.props.toParent(res.current_n, res.total_n)
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }
    render(){
        const {error, isLoaded, items} = this.state;
        let jackpotList;
        if((error) || (items===undefined)){
            jackpotList = <div class="jackpot_list">Couldn't load current jackpots</div>;
        }
        else if((isLoaded) && (items!==undefined)){
            jackpotList =
                <div class="jackpot_list">
                    {items.map(item => (
                        <Link to={`/jackpots/${item.jackpot_id}`}>
                            <JackpotBox
                                jackpot_id={item.jackpot_id}
                                jackpot_class={item.jackpot_class}
                                jackpot_title={item.jackpot_title}
                                jackpot_value={item.total_value}
                                jackpot_start={item.start.slice(0,10)}
                                jackpot_end={item.end.slice(0,10)}
                                jackpot_status={item.user_status}
                                jackpot_entity={item.jackpot_entity}
                                />
                        </Link>
                        ))
                    }
                </div>;
        }
        else{
            jackpotList = <div><p>Loading ...</p></div>;
        }
        return(
            <div>
                {jackpotList}
            </div>
        )
    }
}

export default Jackpots;