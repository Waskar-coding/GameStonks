//Standard
import React from "react";

//Local components
import DefaultError from "../error-components/default-error";
import DefaultLoad from "../load-components/default-load";

//Main function
const withDefaultLoadError = (ApiComponent, SuccessComponent, url, loadMessage, errorDict) => {
    return (
        <ApiComponent
            url={url}
            LoadComponent={DefaultLoad}
            loadMessage={loadMessage}
            ErrorComponent={DefaultError}
            errorDict={errorDict}
            render={(apiStatus,newState) => <SuccessComponent apiStatus={apiStatus} state={newState} />}
        />
    )
}
export default withDefaultLoadError;