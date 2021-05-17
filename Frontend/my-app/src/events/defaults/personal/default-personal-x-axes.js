//Useful function
import configDefaultXAxes from "../../../chart-configuration/xaxes-default-config";
import getLocalDate from "../../../data-manipulation/date-offset";

//Main function
function configDefaultPersonalXAxes(date, context){
    const start = getLocalDate(new Date(date));
    const today = getLocalDate(new Date());
    const tomorrow = new Date(today.setDate(today.getDate() + 1));
    return [start, tomorrow, configDefaultXAxes(start, tomorrow, context)];
}
export default configDefaultPersonalXAxes;