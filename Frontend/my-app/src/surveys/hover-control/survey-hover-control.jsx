//Standard
import React, {useState} from "react";

//Main function
const HoverControl = ({formik, questionId, hoverField, children}) => {
    const [hoverStart, setHoverStart] = useState(Date.now());
    return(
        <div
            onMouseEnter={() => setHoverStart(Date.now())}
            onMouseLeave={() => {
                formik.setFieldValue(
                    `${questionId}.meta.${hoverField}`,
                    formik.values[questionId].meta[hoverField]+Date.now()-hoverStart
                )
            }}
        >
            {children}
        </div>
    )
}
export default HoverControl;