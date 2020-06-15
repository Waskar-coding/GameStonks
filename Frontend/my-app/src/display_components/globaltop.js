import React from "react";

class GlobalTop extends React.Component{
    constructor(props){
        super(props);
        const isEmpty = props.top.length === 0;
        const isIncomplete = (isEmpty === false) && (props.top.length < 10);
        this.state = {
            isEmpty: isEmpty,
            isIncomplete: isIncomplete,
            isLoaded: false,
            players: []
        };
    }
    componentDidMount(){
        if(this.state.isEmpty === false){
            getTopRegisters(this)
        }
        else{
            this.setState({
                isLoaded: true
            })
        }
    }
    render(){
        if((this.state.isLoaded === true)&&(this.state.isEmpty ===true)){
            return(<div>No players yet</div>)
        }
        else if((this.state.isLoaded === true)&&(this.state.isIncomplete ===true)){
            return(<div>Not enough players for a complete top 10</div>)
        }
        else if((this.state.isLoaded === true)&&(this.state.players !== [])){
            return(
                <div>
                {this.state.players.map(topPlayer => {
                        return <div><div><img src={topPlayer.thumbnail} alt={`${topPlayer.name}'s thumbnail`} width="50"/></div><div>{topPlayer.name}</div><div>Share: {topPlayer.score} $</div></div>;
                    })}
                </div>
        )
        }
        else{
            return(<div>Loading ...</div>)
        }

    }
}

const getTopRegisters = async (session) => {
    let i=0;
    const topRegisters = [];
    for(i;i< session.props.top.length; i++){
        const response = await fetch(`../../users/top/${session.props.top[i][0]}`);
        const user = await response.json();
        topRegisters.push({name: user.name, thumbnail: user.thumbnail,score: session.props.top[i][1]});
        if(i === session.props.top.length-1){
            session.setState({
                players: topRegisters,
                isLoaded: true
            })
        }
    }
};

export default GlobalTop;