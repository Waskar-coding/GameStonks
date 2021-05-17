//Standard
import React from "react";

//Main function
const DescriptionBox = ({title, thumbnail, alt, table}) => {
    let rowNum = 0;
    let colNum = 0;
    return(
        <div>
            <div><img src={thumbnail} alt={alt} /></div>
            <div>
                <div><h1>{title}</h1></div>
                <div>
                    <table>
                        <tbody>
                        {table.map(tableRow => {
                            rowNum++;
                            colNum = 0;
                            return(
                                <tr key={rowNum-1}>
                                    {tableRow.map(tablePair => {
                                        colNum++;
                                        return(
                                            <td key={colNum-1}>
                                                <span>{`${tablePair[0]}: `}</span><span>{tablePair[1]}</span>
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

export default DescriptionBox;