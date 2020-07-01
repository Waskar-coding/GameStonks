//Standard
import React from "react";

//Packages
import queryString from "query-string";

//Local components
import SearchForm from "./search-form";

//Language jsons
import messageDict from "../language-display/message-classifier";

//Context
import LanguageContext from "../language-context";
import findMaxPage from "./max-page";
import PageList from "./page-list";

class Search extends React.Component{
    constructor(props){
        super(props);
        if(props.location.search!=="") {
            const query = queryString.parse(props.location.search);
            if(
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
            }
            else {
                this.state = {
                    error: null,
                    sort: props.defaultSort,
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
                sort: props.defaultSort,
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
        window.location = (`./find?sort=${this.state.sort}&order=${this.state.order}&page=${page}&search=${this.state.search}`)
    }
    callbackSearch(sort, order, search){
        window.location = (`./find?sort=${sort}&order=${order}&page=1&search=${search}`)
    }
    callbackLoad(current_n){
        this.setState({
            current_number: current_n
        });
    }
    render(){
        const currentUsers = (this.state.current_number!==undefined)? this.state.current_number : 0;
        return(
            <div>
                <SearchForm
                    message={`${messageDict['Search'][this.props.message][this.context]}${currentUsers}`}
                    options={this.props.options}
                    toParent={this.callbackSearch}
                    sort={this.state.sort}
                    order={this.state.order}
                    search={this.state.search}
                    placeholder={messageDict['Search'][this.props.placeholder][this.context]}
                    tooltip={this.props.tooltip}
                />
                {
                    React.Children.map(this.props.children, child => {
                        if(React.isValidElement(child)){
                            return React.cloneElement(
                                child,
                                {
                                    page: this.state.page,
                                    sort: this.state.sort,
                                    order: this.state.order,
                                    search: this.state.search,
                                    toParent: this.callbackLoad
                                }
                            )
                        }
                    })
                }
                <PageList
                    current={this.state.page}
                    toParent={this.callbackPage}
                    maxpage={findMaxPage(currentUsers, this.props.displayPerPage).toString()}
                />
            </div>
        )
    }
}
Search.contextType = LanguageContext;

export default Search;