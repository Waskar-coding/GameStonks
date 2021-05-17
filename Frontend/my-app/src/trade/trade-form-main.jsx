//Standard
import React from "react";

//Packages
import {Formik, Form} from "formik";

//Useful functions
import getInitial from "./trade-form-initial";

//Local components
import TradeOptions from "./trade-form-type";
import TradeValue from "./trade-form-value";
import Transaction from "../display-components/transaction";

//Main function
const TradeForm = (
    {
        myTradeOptions, userTradeOptions,
        myTradeData, userTradeData,
        initialValues, submitFunction
    }
) => {
    /*
    FORM FOR CREATING TRADE OFFER IN
    BOTH USER PROFILES AND EVENTS
    */
    return (
        <div>
            <Transaction
                myBasic={myTradeData}
                userBasic={userTradeData}
            />
            <Formik
                initialValues={{
                    ...initialValues,
                    cashedTypeOut: initialValues.offerTypeOut,
                    cashedTypeIn: initialValues.offerTypeIn
                }}
                onSubmit={values => submitFunction(values)}
                validate={values => {
                    if(
                        (values.offerTypeOut === 'cash') &&
                        (values.offerTypeIn === 'cash')
                    ) return {offerValueOut: 'No cash for cash', offerValueIn: 'No cash for cash'};
                    return;
                }}
                validateOnBlur={false}
                validateOnMount={false}
            >
                {formik => {
                    const {
                        offerTypeOut,offerTypeIn,
                        cashedTypeOut, cashedTypeIn
                    } = formik.values;
                    /*
                    Every time the item type is changed
                    in  any of the parts it is detected
                    through cashed types and set to a
                    the proper initial value
                    */
                    if(cashedTypeOut !== offerTypeOut){
                        formik.setValues({
                            ...formik.values,
                            offerValueOut: getInitial(offerTypeOut, myTradeData),
                            cashedTypeOut: offerTypeOut
                        });
                    }
                    if(cashedTypeIn !== offerTypeIn){
                        formik.setValues({
                            ...formik.values,
                            offerValueIn: getInitial(offerTypeIn, userTradeData),
                            cashedTypeIn: offerTypeIn
                        });
                    }
                    return(
                        <Form>
                            <div style={{display: "flex"}}>
                                <div style={{flex: "50%"}}>
                                    <TradeOptions
                                        fieldName="offerTypeOut"
                                        tradeOptions={myTradeOptions}
                                    />
                                    <TradeValue
                                        fieldName="offerValueOut"
                                        tradeType={formik.values.offerTypeOut}
                                        tradeData={myTradeData}
                                    />
                                </div>
                                <div style={{flex: "50%"}}>
                                    <TradeOptions
                                        fieldName="offerTypeIn"
                                        tradeOptions={userTradeOptions}
                                    />
                                    <TradeValue
                                        fieldName="offerValueIn"
                                        tradeType={formik.values.offerTypeIn}
                                        tradeData={userTradeData}
                                    />
                                </div>
                            </div>
                            <button type="submit">Submit</button>
                        </Form>
                    )
                }}
            </Formik>
        </div>
    )
}
export default TradeForm;