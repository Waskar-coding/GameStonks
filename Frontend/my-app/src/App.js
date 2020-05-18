import React from 'react';
import Jackpots from './jackpots/JackpotListCopy';
import DocList from './docs_navigation/DocList';
import J01Router from './jackpots/J01/J01.main';
import AllJackpots from './jackpots/JackpotRouter';


class App extends React.Component{
    render(){
        return(<AllJackpots />)
    }
}

export default App;