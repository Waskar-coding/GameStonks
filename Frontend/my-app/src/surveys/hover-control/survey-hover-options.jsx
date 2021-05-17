//Standard
import React, {useState} from "react";

//Main function
const HoverOption = ({formik, questionId, index, children}) => {
    const [hoverOptionStart, setHoverOptionStart] = useState(Date.now());
    return (
        <div
            onMouseEnter={() => setHoverOptionStart( Date.now() )}
            onMouseLeave={() => {
                formik.setFieldValue(
                    `${questionId}.meta.hovering_answers[${index}]`,
                    formik.values[questionId].meta.hovering_answers[index] + Date.now() - hoverOptionStart
                )
            }}
        >
            {children}
        </div>
    )
}
export default HoverOption;