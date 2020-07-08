function configDefaultTooltips(unit){
    return (
        {
            enabled: true,
            mode: 'label',
            displayColors: false,
            callbacks: {
                title: function(){},
                label: function(tooltipItem) {
                    const date = new Date(tooltipItem.xLabel).toISOString().slice(0,10);
                    const hour = new Date(tooltipItem.xLabel).toISOString().slice(11,16);
                    return [date + ' ' + hour, tooltipItem.value.slice(0,5) + unit];
                }
            }
        }
    )
}

export default configDefaultTooltips;