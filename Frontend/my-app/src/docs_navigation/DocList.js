import React from "react";
import "./DocList.css";

class DocList extends React.Component{
    constructor(){
        super();
        this.handleDocChange = this.handleDocChange.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (this.props.current !== nextProps.current) || (this.props.docs !== nextProps.docs);
    }
    handleDocChange(docName){
        this.props.toParent(docName)
    }
    render(){
        return(
            <div id="doc_list"><nav>
                {this.props.docs.map(doc => (
                    <DocBox
                        toParent={this.handleDocChange}
                        active={(this.props.current === doc).toString()}
                        docName={doc}
                        />
                ))}
            </nav></div>
        )
    }
}


class DocBox extends React.Component{
    render(){
        const docBoxStyle = (Boolean(this.props.active==="true"))? "selected_doc_box": "doc_box";
        return(
                <button class={docBoxStyle} onClick={() => {this.props.toParent(this.props.docName)}}>
                    {this.props.docName}
                </button>
        )
    }
}

export default DocList;