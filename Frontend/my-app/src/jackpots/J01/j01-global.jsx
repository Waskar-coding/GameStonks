//Standard
import React from "react";

//Packages
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';

//Local components
import DescriptionBox from "../../display-components/description-box";
import SimpleChart from "../../display-components/simple-chart";
import BarChart from "../../display-components/bar-chart";
import GlobalTop from "../../display-components/global-top";

//Local images
import jackpotThumbnail from "../jackpot_icons/J01.jpg";

//Useful functions
import configDefaultXAxes from "../../useful-functions/xaxes-default-config";
import configDefaultTooltips from "../../useful-functions/tooltips-default-config";
import getLocalDate from "../../useful-functions/date-offset";

//Language jsons
import otherDict from "../../language-display/other-classifier";
import messageDict from "../../language-display/message-classifier";
import interactiveDict from "../../language-display/interactive-classifier";

//Context
import LanguageContext from "../../language-context";


class J01Global extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            resume: null,
            users: null,
            price: null,
            score: null,
            top: null,
            isLoaded: false
        };
    }
    componentDidMount(){
        fetch(`/jackpots/${this.props.jackpotId}/global?language=${this.context}`)
            .then(res => res.json())
            .then(
                (res) => {
                    this.setState({
                        title: res.title,
                        entity: res.entity,
                        current_value: res.current_value,
                        current_users: res.current_users,
                        start: getLocalDate(new Date(res.start)),
                        final: getLocalDate(new Date(res.final)),
                        multipliers: res.multipliers,
                        users: res.users.map(point => {
                            return {x: getLocalDate(new Date(point[0])).getTime(),y: point[1]}
                        }),
                        price: res.price.map(point => {
                            return {x: getLocalDate(new Date(point[0])).getTime(),y: point[1]}
                        }),
                        score: res.score,
                        top: res.top,
                        isLoaded: true,
                        error: false
                    });
                }
            )
            .catch(() => {
                this.setState({
                    isLoaded: true,
                    error: true
                })
            })
    }
    render(){
        if(
            (this.state.isLoaded === true)
            ||
            (this.state.error === false)
        ){
            const xAxes = configDefaultXAxes(this.state.start, this.state.final, this.context);
            return(
                <div>
                    <DescriptionBox
                        thumbnail={jackpotThumbnail}
                        alt='Event thumbnail'
                        title={this.state.title}
                        table={[
                            [
                                [
                                    otherDict['jackpot']['jackpot-sponsor'][this.context],
                                    this.state.entity
                                ],
                                [
                                    otherDict['jackpot']['jackpot-start'][this.context],
                                    this.state.start.toISOString().slice(0,10)
                                ]
                            ],
                            [
                                [
                                    otherDict['jackpot']['jackpot-value'][this.context],
                                    this.state.current_value
                                ],
                                [
                                    otherDict['jackpot']['jackpot-final'][this.context],
                                    this.state.final.toISOString().slice(0,10)
                                ]
                            ],
                            [
                                [
                                    otherDict['jackpot']['jackpot-users'][this.context],
                                    this.state.current_users
                                ],
                                [
                                    otherDict['jackpot']['jackpot-allowed-multipliers'][this.context],
                                    this.state.multipliers
                                ]
                            ]
                        ]}
                    />
                    <div>
                        <h2>{otherDict['jackpot']['jackpot-user-chart-title'][this.context]}</h2>
                        <div>
                            <Tippy content={interactiveDict['jackpot-tooltips']['global-user-chart'][this.context]}>
                                <div>Info</div>
                            </Tippy>
                        </div>
                        <SimpleChart
                            title="Active users"
                            points={this.state.users}
                            yLabel={otherDict['chart']['y-label-users'][this.context]}
                            xAxes={xAxes}
                            tooltips={configDefaultTooltips(' users')}
                        />
                    </div>
                    <div>
                        <h2>{otherDict['jackpot']['jackpot-value-chart-title'][this.context]}</h2>
                        <div>
                            <Tippy content={interactiveDict['jackpot-tooltips']['global-value-chart'][this.context]}>
                                <div>Info</div>
                            </Tippy>
                        </div>
                        <SimpleChart
                            title="Event value"
                            points={this.state.price}
                            yLabel={otherDict['chart']['y-label-money'][this.context]}
                            xAxes={xAxes}
                            tooltips={configDefaultTooltips('$')}
                        />
                    </div>
                    <div>
                        <h2>{otherDict['jackpot']['jackpot-user-chart-title'][this.context]}</h2>
                        <div>
                            <Tippy content={interactiveDict['jackpot-tooltips']['global-value-dist'][this.context]}>
                                <div>Info</div>
                            </Tippy>
                        </div>
                        {(this.state.score.length === 0)? (
                            <div style={{backgroundColor: "rgba(0,0,0,0.5)", position:"relative"}}>
                                <div style={{color: "white", position:"absolute", top: "50%", left: "50%"}}>
                                    {otherDict['bars']['not-found'][this.context]}
                                </div>
                                <div>
                                    <BarChart
                                        points={[]}
                                        title="Wealth distribution"
                                        labels={[
                                            otherDict['bars']['lowest'][this.context],
                                            '', '','', '','','','',
                                            otherDict['bars']['highest'][this.context]
                                        ]}
                                        yLabel={otherDict['bars']['y-label-wealth-percent'][this.context]}
                                    />
                                </div>
                            </div>
                        ) : (
                            <BarChart
                                points={this.state.score}
                                title="Wealth distribution"
                                labels={[
                                    otherDict['bars']['lowest'][this.context],
                                    '', '','', '','','','',
                                    otherDict['bars']['highest'][this.context]
                                ]}
                                yLabel={otherDict['bars']['y-label-wealth-percent'][this.context]}
                            />
                        )}
                        </div>
                    <div>
                        <h2>{otherDict['jackpot']['jackpot-top-title'][this.context]}</h2>
                        <div>
                            <Tippy content={interactiveDict['jackpot-tooltips']['global-user-top'][this.context]}>
                                <div>Info</div>
                            </Tippy>
                        </div>
                        {(this.state.top.length === 0)? (
                            <div>{otherDict['bars']['y-label-wealth-percent'][this.context]}</div>
                        ):(
                            <GlobalTop
                                players={this.state.top}
                                incompleteMessage={messageDict['jackpot-stats']['global-top']['incomplete'][this.context]}
                                completeLength={10}
                            />
                        )
                        }
                    </div>
                </div>
            )
        }
        else if((this.state.isLoaded===true) || (this.state.error===true)){
            return(<h1>Error</h1>)
        }
        else{
            return(<h1>Loading...</h1>);
        }
    }
}
J01Global.contextType = LanguageContext;

export default J01Global;