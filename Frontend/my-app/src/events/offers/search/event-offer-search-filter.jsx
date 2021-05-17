//Standard
import React from "react";

//Packages
import { Field, Form, ErrorMessage } from "formik";

//Main function
const EventOfferSearchFilter = () =>
    <div style={{display: "flex"}}>
        <Form>
            <EventOfferSearchCheckbox fieldName="offerTypeOut" />
            <EventOfferSearchCheckbox fieldName="offerTypeIn" />
        </Form>
    </div>
export default EventOfferSearchFilter;

const EventOfferSearchCheckbox = ({fieldName}) =>
    <div style={{flex: "50%"}}>
        {fieldName === "offerTypeOut"? "Offered items: " : "Searched items: "}
        <Field type="checkbox" name={fieldName} value="cash"/>
        {"cash"}
        <Field type="checkbox" name={fieldName} value="multiplier"/>
        {"multipliers"}
        <Field type="checkbox" name={fieldName} value="handshake"/>
        {"handshakes"}
        <ErrorMessage name={fieldName} />
    </div>