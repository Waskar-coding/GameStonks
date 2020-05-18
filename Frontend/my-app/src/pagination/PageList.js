import React from "react";
import "./PageBox.css"
import './PageList.css';
class PageList extends React.Component{
    constructor(){
        super();
        this.handlePageChange = this.handlePageChange.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (this.props.current !== nextProps.current) || (this.props.maxpage !== nextProps.maxpage);
    }
    handlePageChange(page){
        this.props.toParent(page);
    }
    render(){
        const current = Number(this.props.current);
        const maxpage = Number(this.props.maxpage);
        const limitArray = getPageInterval(current, maxpage);
        const pageArray = range(limitArray[0], limitArray[1]);

        let showFirst = (limitArray[0]!==1)?
            <PageBox
                pageDisplay="1 ..."
                pageNum="1"
                active="false"
                toParent={this.handlePageChange}
                />
            :
            "";
        if(limitArray[0]===2){
            showFirst = <PageBox
                            pageDisplay="1"
                            pageNum="1"
                            active="false"
                            toParent={this.handlePageChange}
                            />
        }

        let showLast = (limitArray[1] !== maxpage)?
            <PageBox
                pageDisplay={`...${maxpage}`}
                pageNum={maxpage}
                active="false"
                toParent={this.handlePageChange}
                />
            :
            "";
        if(limitArray[1] === maxpage-1){
            showLast = <PageBox
                            pageDisplay={maxpage}
                            pageNum={maxpage}
                            active="false"
                            toParent={this.handlePageChange}
                            />
        }

        const showPrev = ((current !== 1) && (maxpage!==1))?
            <PageBox
                pageDisplay="Previous"
                pageNum={current-1}
                active="false"
                toParent={this.handlePageChange}
                />
            :
            "";

        const showNext = ((current !== maxpage) && (maxpage!==1))?
            <PageBox
                pageDisplay="Next"
                pageNum={current+1}
                active="false"
                toParent={this.handlePageChange}
                />
            :
            "";

        return(
            <div class="pages_cage">
                {showPrev}
                {showFirst}
                {pageArray.map(page => (
                        <PageBox
                            pageDisplay={page.toString()}
                            pageNum={page.toString()}
                            active={(page===current).toString()}
                            toParent={this.handlePageChange}
                            />
                    ))
                }
                {showLast}
                {showNext}
            </div>
        )
    }
}

function getPageInterval(p, m){
    /*
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


class PageBox extends React.Component{
    constructor(){
        super();
    }
    render(){
        const pageBoxStyle = (Boolean(this.props.active==="true"))? "selected_page_box": "page_box";
        return(
            <button onClick={() => {this.props.toParent(this.props.pageNum)}}>
                <span class={pageBoxStyle}>
                    {this.props.pageDisplay}
                </span>
            </button>
    )
    }
}


export default PageList;
