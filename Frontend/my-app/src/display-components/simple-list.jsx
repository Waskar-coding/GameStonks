//Standard
import React from "react";

//Main function
const SimpleList = ({title, list, useLinks, target}) => {
    let counter = 0;
    if(useLinks === false){
        return(
            <div style={{display: "inline-block", marginLeft: "10px", marginRight: "10px"}}>
                <div><h1>{title}</h1></div>
                <div>
                    <ul style={{listStyleType:"none"}}>
                        {list.map(component => {
                            counter++;
                            return <li key={counter-1}>{component}</li>;
                        })}
                    </ul>
                </div>
            </div>
        )
    }
    else{
        return(
            <div style={{display: "inline-block", marginLeft: "10px", marginRight: "10px"}}>
                <div><h1>{title}</h1></div>
                <div>
                    <nav>
                        <ul style={{listStyleType:"none"}}>
                            {list.map(component => {
                                counter++;
                                return(
                                    <li key={counter-1}>
                                        <a href={component[1]} target={target}>{component[0]}</a>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </div>
            </div>
        )
    }
}
export default SimpleList;