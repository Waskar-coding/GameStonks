//Useful functions
import configMoneyDisplay from "../data-manipulation/config-money-display";

//Main function
const configDefaultTooltips = (unit) => {
    return (
        {
            enabled: true,
            mode: 'label',
            displayColors: false,
            callbacks: {
                title: () => {},
                label: (tooltipItem) => {
                    const value = unit === '$'? configMoneyDisplay(tooltipItem.value) : tooltipItem.value;
                    const date = new Date(tooltipItem.xLabel).toISOString().slice(0,10);
                    const hour = new Date(tooltipItem.xLabel).toISOString().slice(11,16);
                    return [date + ' ' + hour, value + unit];
                }
            }
        }
    )
}

export default configDefaultTooltips;