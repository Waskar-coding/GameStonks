import otherDict from "../language-display/other-classifier.json";

function configDefaultXAxes(start, final, context){
    return(
        {
            type: 'linear',
            ticks: {
                min: start.getTime(),
                max: final.getTime(),
                stepSize: (final.getTime()-start.getTime())/10,
                callback: value => {
                    const date = new Date(value).toISOString();
                    return date.slice(0,10) + ' ' + date.slice(11,16);
                }
            },
            scaleLabel: {
                display: true,
                labelString: otherDict['chart']['x-label-date'][context]
            }
        }
    )

}

export default configDefaultXAxes;