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


//Update location
const updateLocation = (location, defaultSort) => {
    /*
        Parses the querystring and modifies the state of the main class,
        if the querystring does not exist, or it is invalid return default
        values
    */
    const query = queryString.parse(location);
    if(
        (query.page !== undefined)
        && (query.sort !== undefined)
        && (query.order !== undefined)
        && (query.search !== undefined)
    ) {
        return(
            {
                error: null,
                sort: query.sort,
                order: query.order,
                search: query.search,
                page: query.page,
                currentNumber: 1,
            }
        )
    }
    else {
        return(
            {
                error: null,
                sort: defaultSort,
                order: '1',
                search: "",
                page: 1,
                currentNumber: 1,
            }
        )
    }
}

//Main class
class SearchList extends React.Component{
    /*
        This Wrapper is used to pass data to child components that fetch
        items from DB, using the following parameters:
            * sort: Parameter used to sort the items
            * order: Ascending or descending according to sort
            * search: Name of the item
            * page: Offset
        It includes a SearchForm component that allows to introduce the 3
        first parameters and a PageList component that allows to introduce
        the last one.
        The Wrapped component must include the following features:
            * A callback function that indicates the total number of items found
            * A backend API that fetches items using the given parameters.
        The Wrapper must be passed with the following props:
            * defaultSort: Default value for the sort parameter
            * displayPerPage: Number of items to display in each page
            * message: Key of the message indicating the currentNumber of items.
            * placeholder: Key of the message displayed as a placeholder on the
                search field in SearchForm.
            * tooltip: Key of the message displayed when the submit button on
                SearchForm is hovered.
            * options: Stringified JSON including the names of all the sort parameters
                (keys) and value with which they will be displayed (can be included in
                message-classifier.json to display it according to LanguageContext).
        All message keys must be included within message-classifier.json in order to
        display their values according to LanguageContext
    */
    constructor(props){
        super(props);
        this.state = updateLocation(props.location.search, props.defaultSort);
        this.onBackButtonEvent = this.onBackButtonEvent.bind(this);
        this.callbackPage = this.callbackPage.bind(this);
        this.callbackSearch = this.callbackSearch.bind(this);
        this.callbackLoad = this.callbackLoad.bind(this);
    }
    onBackButtonEvent = () => {
        /*
            When back button is pressed updateLocation is executed to pass the new
            state determined by the query string
        */
        const queryState = updateLocation(window.location.search, this.props.defaultSort);
        this.setState({
            error: queryState.error,
            sort: queryState.sort,
            order: queryState.order,
            search: queryState.search,
            page: queryState.page
        })
    }
    componentDidMount() {
        window.onpopstate = this.onBackButtonEvent;
    }
    callbackPage(page){
        /*
            Executes when the child component PageList passes new data,
            state is passed to the other child components and new items are fetched
        */
        this.setState({
            page: page
        })
    }
    callbackSearch(sort, order, search){
        /*
            Executes when the child component SearchForm passes new data,
            state is passed to the other child components and new items are fetched
        */
        this.setState({
            sort: sort,
            order: order,
            search: search,
            page: 1
        })
    }
    callbackLoad(currentNumber){
        /*
           All children component which fetch data from DB must have a callback function
           that passes the total number of items found.
        */
        this.setState({
            currentNumber: currentNumber
        });
    }
    render(){
        const currentNumber = (this.state.currentNumber!==undefined)? this.state.currentNumber : 0;
        const sort = this.state.sort;
        const order = this.state.order;
        const search = this.state.search;
        const page = this.state.page;
        return(
            <div>
                <SearchForm
                    message={`${messageDict['Search'][this.props.message][this.context]}${currentNumber}`}
                    options={this.props.options}
                    toParent={this.callbackSearch}
                    sort={sort}
                    order={order}
                    search={search}
                    placeholder={messageDict['Search'][this.props.placeholder][this.context]}
                    tooltip={this.props.tooltip}
                />
                {
                    React.Children.map(this.props.children, child => {
                        if(React.isValidElement(child)){
                            return React.cloneElement(
                                child,
                                {
                                    page: page,
                                    sort: sort,
                                    order: order,
                                    search: search,
                                    toParent: this.callbackLoad
                                }
                            )
                        }
                    })
                }
                <PageList
                    sort={sort}
                    order={order}
                    search={search}
                    current={page}
                    toParent={this.callbackPage}
                    maxpage={findMaxPage(currentNumber, this.props.displayPerPage).toString()}
                />
            </div>
        )
    }
}
SearchList.contextType = LanguageContext;
export default SearchList;