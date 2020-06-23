import React from "react";
import AllJackpots from '../jackpots/JackpotRouter';

class SimpleList extends React.PureComponent{
    render(){
        let listComponents;
        if(this.props.useLinks === false){
            listComponents = <ul style={{listStyleType:"none"}}>{this.props.list.map(component => {
                return <li>{component}</li>;
            })}</ul>
        }
        else{
            listComponents = <nav><ul style={{listStyleType:"none"}}>{this.props.list.map(component => {
                return <li><a href={component[1]}>{component[0]}</a></li>;
            })}</ul></nav>
        }
        return(
                <div style={{display: "inline-block", marginLeft: "10px", marginRight: "10px"}}>
                    <div><h1>{this.props.title}</h1></div>
                    <div>{listComponents}</div>
                </div>
        )
    }
}

export default SimpleList;