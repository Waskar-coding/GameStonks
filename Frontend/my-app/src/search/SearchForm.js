import React from "react";
import "./SearchForm.css";

class SearchForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            sort: props.sort,
            order: props.order,
            search: props.search
        };
        this.handleParamChange = this.handleParamChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (this.props !== nextProps) || (this.state !== nextState);
    }
    handleParamChange(event){
        this.setState({[event.target.id]: event.target.value})
    }
    handleSubmit(event){
        event.preventDefault();
        const sort = this.state.sort;
        const order = this.state.order;
        const search = this.state.search;
        this.props.toParent(sort,order,search)

    }
    render(){
        const filterFields = Object.entries(JSON.parse(this.props.options));
        return(
            <div class="searchform">
                <div class="message_case">
                    {this.props.message}
                </div>
                <form class="params_case" onSubmit={this.handleSubmit} >
                    <div class="param">
                        <label for="sort">Sort by </label>
                        <select id="sort" value={this.state.sort} onChange={this.handleParamChange}>
                            {filterFields.map(item => {
                                return <option value={item[0]}>{item[1]}</option>
                            })}
                        </select>
                    </div>
                    <div class="param">
                        <label for="order">Order </label>
                        <select id="order" value={this.state.order} onChange={this.handleParamChange}>
                            <option value="1">Ascending</option>
                            <option value="-1">Descending</option>
                        </select>
                    </div>
                    <div class="param">
                        <label for id="search">Search </label>
                        <input
                            type="text"
                            id="search"
                            value={this.state.search}
                            onChange={this.handleParamChange}
                            placeholder={this.props.placeholder}
                            />
                    </div>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }
}

export default SearchForm;