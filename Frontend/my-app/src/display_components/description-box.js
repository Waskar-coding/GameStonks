import React from "react";

class DescriptionBox extends React.PureComponent{
    render(){
        let rowNum = 0;
        let colNum = 0;
        return(
            <div>
                <div>
                    <img src={this.props.thumbnail} alt={this.props.alt} />
                </div>
                <div>
                    <div>
                        <h1>{this.props.title}</h1>
                    </div>
                    <div>
                        <table>
                            <tbody>
                                {this.props.table.map(tableRow => {
                                    rowNum++;
                                    colNum = 0;
                                    return(
                                        <tr key={rowNum-1}>
                                            {tableRow.map(tablePair => {
                                                colNum++;
                                                return(
                                                    <td key={colNum-1}>
                                                        <span>
                                                            {`${tablePair[0]}: `}</span><span>{tablePair[1]}
                                                        </span>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}

export default DescriptionBox;