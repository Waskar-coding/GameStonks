//Standard
import React from "react";

//Packages
import { Link } from "react-router-dom";

//Stylesheets
import "./PageBox.css"
import './PageList.css';

//Language jsons
import interactiveDict from "../language-display/interactive-classifier";

//Main class
class PageList extends React.Component{
    /*
        Child component of SearchList (see documentation on
        search-list.jsx).
    */
    constructor(props){
        super(props);
        this.handlePageChange = this.handlePageChange.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (this.props.current !== nextProps.current) || (this.props.maxpage !== nextProps.maxpage);
    }
    handlePageChange(page){
        this.props.toParent(page);
    }
    render(){
        const sort = this.props.sort;
        const order = this.props.order;
        const search = this.props.search;
        const current = Number(this.props.current);
        const maxPage = Number(this.props.maxpage);
        const limitArray = getPageInterval(current, maxPage);
        const pageArray = range(limitArray[0], limitArray[1]);
        return(
            <div className="pages_cage">
                <nav>
                    <ul
                        style={{
                            listStyleType: "none",
                            display: "flex"
                        }}
                    >
                        <li key='prev'>
                            <PreviousPage
                                sort={sort}
                                order={order}
                                search={search}
                                current={current}
                                maxPage={maxPage}
                                toParent={this.handlePageChange}
                            />
                        </li>
                        <li key='first'>
                            <FirstPage
                                sort={sort}
                                order={order}
                                search={search}
                                limitArray={limitArray}
                                toParent={this.handlePageChange}
                            />
                        </li>
                        {pageArray.map(page => {
                            return(
                                <li key={page}>
                                    <PageBox
                                        sort={sort}
                                        order={order}
                                        search={search}
                                        pageDisplay={page.toString()}
                                        pageNum={page.toString()}
                                        active={page===current}
                                        toParent={this.handlePageChange}
                                    />
                                </li>
                            )
                        })}
                        <li key='last'>
                            <FinalPage
                                sort={sort}
                                order={order}
                                search={search}
                                limitArray={limitArray}
                                maxPage={maxPage}
                                toParent={this.handlePageChange}
                            />
                        </li>
                        <li key='next'>
                            <NextPage
                                sort={sort}
                                order={order}
                                search={search}
                                current={current}
                                maxPage={maxPage}
                                toParent={this.handlePageChange}
                            />
                        </li>
                    </ul>
                </nav>
            </div>
        )
    }
}

class PreviousPage extends React.Component{
    constructor(props) {
        super(props);
        this.handlePageChange = this.handlePageChange.bind(this);
    }
    handlePageChange(page){
        this.props.toParent(page);
    }
    render(){
        const current = this.props.current;
        const maxPage = this.props.maxPage;
        if((current !== 1) && (maxPage!==1)){
            return(
                <PageBox
                    sort={this.props.sort}
                    order={this.props.order}
                    search={this.props.search}
                    pageDisplay={interactiveDict['pagination']['previous']['ES']}
                    pageNum={current-1}
                    active={false}
                    toParent={this.handlePageChange}
                />
            )
        }
        else{
            return(<div />)
        }
    }
}

class NextPage extends React.Component{
    constructor(props) {
        super(props);
        this.handlePageChange = this.handlePageChange.bind(this);
    }
    handlePageChange(page){
        this.props.toParent(page);
    }
    render(){
        const current = this.props.current;
        const maxPage = this.props.maxPage;
        if((current !== maxPage) && (maxPage!==1)){
            return(
                <PageBox
                    sort={this.props.sort}
                    order={this.props.order}
                    search={this.props.search}
                    pageDisplay={interactiveDict['pagination']['next']['ES']}
                    pageNum={current+1}
                    active={false}
                    toParent={this.handlePageChange}
                />
            )
        }
        else{
            return(<div />)
        }
    }
}

class FirstPage extends React.PureComponent{
    constructor(props) {
        super(props);
        this.handlePageChange = this.handlePageChange.bind(this);
    }
    handlePageChange(page){
        this.props.toParent(page);
    }
    render(){
        const limitArray = this.props.limitArray;
        if(limitArray[0]===2){
            return(
                <PageBox
                    sort={this.props.sort}
                    order={this.props.order}
                    search={this.props.search}
                    pageDisplay="1"
                    pageNum="1"
                    active={false}
                    toParent={this.handlePageChange}
                />
            )
        }
        else if(limitArray[0]!==1){
            return(
                <PageBox
                    sort={this.props.sort}
                    order={this.props.order}
                    search={this.props.search}
                    pageDisplay="1 ..."
                    pageNum="1"
                    active={false}
                    toParent={this.handlePageChange}
                />
            )
        }
        else{
            return(<div />)
        }
    }
}

class FinalPage extends React.PureComponent{
    constructor(props) {
        super(props);
        this.handlePageChange = this.handlePageChange.bind(this);
    }
    handlePageChange(page){
        this.props.toParent(page);
    }
    render(){
        const limitArray = this.props.limitArray;
        const maxPage = this.props.maxPage;
        if(limitArray[1] === maxPage-1){
            return(
                <PageBox
                    sort={this.props.sort}
                    order={this.props.order}
                    search={this.props.search}
                    pageDisplay={maxPage}
                    pageNum={maxPage}
                    active={false}
                    toParent={this.handlePageChange}
                />
            )
        }
        else if(limitArray[1] !== maxPage){
            return(
                <PageBox
                    sort={this.props.sort}
                    order={this.props.order}
                    search={this.props.search}
                    pageDisplay={`...${maxPage}`}
                    pageNum={maxPage}
                    active={false}
                    toParent={this.handlePageChange}
                />
            )
        }
        else{
            return(<div />)
        }
    }
}

class PageBox extends React.PureComponent{
    /*
        Renders a page box, if it is active it is not clickable,
        it will change the location and pass props to parent otherwise.
    */
    render(){
        if(this.props.active){
            return(
                <span className="selected_page_box">
                    {this.props.pageDisplay}
                </span>
            )
        }
        else{
            return(
                <Link to={`./find?sort=${this.props.sort}&order=${this.props.order}&search=${this.props.search}&page=${this.props.pageNum}`}>
                    <button onClick={() => {this.props.toParent(this.props.pageNum)}}>
                        <span className="page_box">
                            {this.props.pageDisplay}
                        </span>
                    </button>
                </Link>
            )
        }
    }
}

function getPageInterval(p, m){
    /*
    Sets the number of PageBox instances that must be displayed according to the
    current page and the last page.
    Step 1:
        Initially the margins are set to X pages previous and X next pages.
    Step 2:
        If a margin surpasses the first or the last page the difference is added
        to the other margin generating two new margins.
    Step 3:
        The limits of the interval are constructed using the current page p and
        the new inferior and superior margins, if the limits surpass the first
        or the last page they are fixed in the first or the last page.
    Step 4:
        An array containing the limits is returned
    */

    //Step 1
    let infMargin = 2;
    let supMargin = 2;

    //Step 2
    const supDiff = (p-infMargin-1);
    const infDiff = (m-p-supMargin);
    const supAdd = (supDiff<=0)? -1*supDiff : 0;
    const infAdd = (infDiff<=0)? -1*infDiff : 0;
    infMargin = infMargin + infAdd;
    supMargin = supMargin + supAdd;

    //Step 3
    const infLimit = (p-infMargin)<1? 1 : p-infMargin;
    const supLimit = (p+supMargin)>m? m : p+supMargin;

    //Step 4
    return [infLimit, supLimit]
}
function range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
        ans.push(i);
    }
    return ans;
}

export default PageList;