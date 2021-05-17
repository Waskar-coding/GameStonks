//Standard
import React from "react";

//Packages
import { Field } from "formik";

//Main function
const TradeOptions = ({fieldName, tradeOptions}) => {
    return (
        <Field
            as="select"
            id={fieldName}
            name={fieldName}
        >
            {tradeOptions.map(tradeOption =>
                <option key={`${tradeOption}_${fieldName}`} value={tradeOption}>
                    {tradeOption}
                </option>
            )}
        </Field>
    )
}
export default TradeOptions;