//Standard
import React, {useContext} from "react";

//Local components
import DefaultPersonalAPI from "../defaults/personal/default-personal-api";
import DefaultPersonalChecking from "../defaults/personal/default-personal-checking";
import DefaultPersonalStack from "../defaults/personal/default-personal-stack";
import DefaultPersonalUnpacking from "../defaults/personal/default-personal-unpacking";
import SimpleChart from "../../display-components/simple-chart";

//Useful functions
import configDefaultPersonalXAxes from "../defaults/personal/default-personal-x-axes";
import getLocalDate from "../../useful-functions/date-offset";

//Language jsons
import otherDict from "../../language-display/other-classifier.json";

//Context
import LanguageContext from "../../language-context";

//Main function
const J01Personal = ({eventId}) => {
    return (
        <DefaultPersonalAPI eventId={eventId}>
            <DefaultPersonalChecking>
                <DefaultPersonalUnpacking>
                    <DefaultPersonalStack>
                        <J01ProductGraph />
                    </DefaultPersonalStack>
                </DefaultPersonalUnpacking>
            </DefaultPersonalChecking>
        </DefaultPersonalAPI>
    )
}

const J01ProductGraph = ({product}) => {
    const language = useContext(LanguageContext);
    if(product){
        return(
            <SimpleChart
                title="Product's gameplay"
                points={product.register_data[1].map(point => {
                    return(
                        {
                            x: getLocalDate(new Date(point[0])),
                            y: point[1]/60
                        }
                    )
                })}
                yLabel={otherDict['chart']['y-label-gameplay'][language]}
                xAxes={configDefaultPersonalXAxes(product.register_date, language)}
                tooltips={{
                    enabled: true,
                    mode: 'label',
                    displayColors: false,
                    callbacks: {
                        title: function(){},
                        label: function(tooltipItem) {
                            const date = new Date(tooltipItem.xLabel).toISOString().slice(0,10);
                            const [hours, decimals]  = tooltipItem.value.toString().split('.');
                            return [date, hours + '.' + decimals.slice(0,2) + 'h'];
                        }
                    }
                }}
            />
        )
    }
    else{
        return(
            <SimpleChart
                title="Product's gameplay"
                points={[]}
                yLabel={otherDict['chart']['y-label-gameplay'][language]}
                xAxes={{}}
                tooltips={{}}
            />
        )
    }

}
export default J01Personal;