//Standard
import React from "react";

//Packages
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';

//Local stylesheets
import "./SearchForm.css";

//Language jsons
import interactiveDict from "../language-display/interactive-classifier";

//Context
import LanguageContext from "../language-context";

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
            <div className="searchform">
                <div className="message_case">
                    {this.props.message}
                </div>
                <form className="params_case" onSubmit={this.handleSubmit} >
                    <div className="param">
                        <label id="sort">{interactiveDict['search-form']['sort'][this.context]}</label>
                        <select id="sort" value={this.state.sort} onChange={this.handleParamChange}>
                            {filterFields.map(item => {
                                return <option key={item[0]} value={item[0]}>{item[1]}</option>
                            })}
                        </select>
                    </div>
                    <div className="param">
                        <label id="order">{interactiveDict['search-form']['order'][this.context]}</label>
                        <select id="order" value={this.state.order} onChange={this.handleParamChange}>
                            <option value="1">{interactiveDict['search-form']['order-ascending'][this.context]}</option>
                            <option value="-1">{interactiveDict['search-form']['order-descending'][this.context]}</option>
                        </select>
                    </div>
                    <div className="param">
                        <label id="search">{interactiveDict['search-form']['search'][this.context]}</label>
                        <input
                            type="text"
                            id="search"
                            value={this.state.search}
                            onChange={this.handleParamChange}
                            placeholder={this.props.placeholder}
                            />
                    </div>
                    <Tippy content={interactiveDict['search-form'][this.props.tooltip][this.context]}>
                        <input type="submit" value="Ok" />
                    </Tippy>
                </form>
            </div>
        )
    }
}

SearchForm.contextType = LanguageContext;

export default SearchForm;