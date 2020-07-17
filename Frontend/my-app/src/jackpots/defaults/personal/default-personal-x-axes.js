//Useful function
import configDefaultXAxes from "../../../useful-functions/xaxes-default-config";
import getLocalDate from "../../../useful-functions/date-offset";

//Main function
function configDefaultPersonalXAxes(date, context){
    const start = getLocalDate(new Date(date));
    const today = getLocalDate(new Date());
    const tomorrow = new Date(today.setDate(today.getDate() + 1));
    return [start, tomorrow, configDefaultXAxes(start, tomorrow, context)];
}
export default configDefaultPersonalXAxes;