import React from "react";

class DescriptionBox extends React.PureComponent{
    render(){
        const thumbnail = <div><img src={this.props.thumbnail} alt={this.props.alt} /></div>;
        const title = <div><h1>{this.props.title}</h1></div>;
        const table = this.props.table.map(tableRow => {
                return <tr>{tableRow.map(tablePair => {
                    return <td><span>{`${tablePair[0]}: `}</span><span>{tablePair[1]}</span></td>
                })}</tr>
            })
        return(
            <div>
                {thumbnail}
                <div>
                    {title}
                    {table}
                </div>
            </div>
        )
    }
}

export default DescriptionBox;