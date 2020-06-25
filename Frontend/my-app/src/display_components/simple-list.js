import React from "react";

class SimpleList extends React.PureComponent{
    render(){
        let counter = 0;
        if(this.props.useLinks === false){
            return(
                <div style={{display: "inline-block", marginLeft: "10px", marginRight: "10px"}}>
                    <div><h1>{this.props.title}</h1></div>
                    <div>
                        <ul style={{listStyleType:"none"}}>
                            {this.props.list.map(component => {
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
                    <div><h1>{this.props.title}</h1></div>
                    <div>
                        <nav>
                            <ul style={{listStyleType:"none"}}>
                                {this.props.list.map(component => {
                                    counter++;
                                    return(
                                        <li key={counter-1}>
                                            <a href={component[1]}>{component[0]}</a>
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
}

export default SimpleList;