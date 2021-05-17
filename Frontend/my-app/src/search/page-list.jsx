//Standard
import React, {useContext} from "react";

//Packages
import queryString from "query-string";

//Stylesheets
import "./PageBox.css"
import './PageList.css';

//Language jsons
import interactiveDict from "../language-display/interactive-classifier";

//Context
import LanguageContext from "../context/language-context";
import {SearchParams} from "../context/search-context";

//Get page interval function
const getPageInterval = (p, m) => {
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

//Range function
const range = (start, end) => {
    const ans = [];
    for (let i = start; i <= end; i++) {
        ans.push(i);
    }
    return ans;
}

//Main function
const PageList = ({current, maxPage}) => {
    const language = useContext(LanguageContext);
    const limitArray = getPageInterval(current, maxPage);
    const pageArray = range(limitArray[0], limitArray[1]);
    return(
        <div className="pages_cage">
            <nav>
                <ul style={{listStyleType: "none", display: "flex"}} >
                    {((current !== 1) && (maxPage!==1)) &&
                        <li key='prev'>
                            <PageBox
                                display={interactiveDict['pagination']['previous'][language]}
                                number={current-1}
                                active={false}
                            />
                        </li>
                    }
                    {(limitArray[0]!==1) &&
                        <li key="first">
                            {(limitArray[0]===2)? (
                                <PageBox display="1" number="1" active={false} />
                            ) : (
                                <PageBox display="1 ..." number="1" active={false} />
                            )}
                        </li>
                    }
                    {pageArray.map(page => {
                        return(
                            <li key={page}>
                                <PageBox display={page.toString()} number={page.toString()} active={page===current} />
                            </li>
                        )
                    })}
                    {(limitArray[1] !== maxPage) &&
                        <li key="last">
                            {(limitArray[1] === maxPage-1)? (
                                <PageBox display={maxPage} number={maxPage} active={false} />
                            ) : (
                                <PageBox display={`...${maxPage}`} number={maxPage} active={false} />
                            )}
                        </li>
                    }
                    {((current !== maxPage) && (maxPage!==1)) &&
                        <li key='next'>
                            <PageBox
                                display={interactiveDict['pagination']['next'][language]}
                                number={current+1}
                                active={false}
                            />
                        </li>
                    }
                </ul>
            </nav>
        </div>
    )
}
export default PageList;

const PageBox = ({display, number, active}) => {
    /*
    Renders a page box, if it is active it is not clickable,
    it will change the location and pass props to parent otherwise.
    */
    const { setSearchParams } = useContext(SearchParams);
    const handlePageClick = () => {
        /*const {sort, order, search} = searchParams.withSearch === true?
            searchParams : {sort: "", order: "", search: ""};

        const nextUrl = searchParams.withSearch === true?
            `?sort=${sort}&order=${order}&search=${search}&page=${number}` : `?page=${number}`;

        */
        const parsedUrl = queryString.parse(window.location.search);
        let newUrl = Object.entries(parsedUrl).reduce((currentUrl, [key, value]) =>
            key === 'page'? currentUrl : currentUrl + key + '=' + value +'&'
        , '?');
        newUrl = newUrl + `page=${number}`;
        window.history.pushState({ ...parsedUrl, page: number }, 'title', newUrl);
        setSearchParams({type: "page", page: number});
    }
    return(
        <div>
            {(active)? (
                <span className="selected_page_box">{display}</span>
            ) : (
                    <button onClick={() => handlePageClick()}>
                        <span className="page_box">{display}</span>
                    </button>
            )}
        </div>
    )
}