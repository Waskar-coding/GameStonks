import 'fs';
import React from "react";
import DocList from "../../docs_navigation/DocList";
import './J01.docs.css';

class J01Doc extends React.Component{
    constructor() {
        super();
        this.state = {
            current: 'Welcome'
        };
        const docArray = ['Welcome', 'Rules'];
        this.handleDocChange = this.handleDocChange.bind(this);
    }
    handleDocChange(doc){
        this.setState({
            current: doc
        })
    }
    render(){
        const docArray = ['Welcome', 'Rules'];
        const componentArray = {
            Welcome: <J01DocsWelcome />,
            Rules: <J01DocsRules />
        }
        return(
            <div id="document_case">
                {componentArray[this.state.current]}
                <DocList
                    docs={docArray}
                    current={this.state.current}
                    toParent={this.handleDocChange}
                    />
            </div>
        )
    }
}


class J01DocsWelcome extends React.Component{
    render(){
        return(
            <article><div class="documentation">
                <h1>Welcome to the monthly J01 Jackpot!</h1>
                <p>
                    With this jackpot we aim to help the developers community to create better games
                    by providing them with some information about their peers performance on Steam.
                    This jackpot focuses in the recently launched games or games released a few months
                    ago that are still relevant in terms of players. The users willing to give
                    information (accepting the privacy agreement) shall be marked as "active" within the
                    jackpot and will opt to win a price.
                </p>
            </div></article>
        )
    }
}


class J01DocsRules extends React.Component{
    render(){
        return(
            <div><article>
                <h1>Rules for the J01 Jackpot</h1>
                <h2>How do I participate?</h2>
                <p>You  participate in the jackpot by any of the following means:</p>
                <ul>
                    <li><p>
                        <b>Let us track your gameplay:</b> Knowing how much time are the users playing on
                        average can be very useful to infer important information about the game. In the
                        Jackpot's features menu you can review the games we are interested in. If you own
                        any of those games you can agree to gives us information about your daily gameplay.
                        Upon agreeing your status in the jackpot will change to "active" and you will be given
                        a score associated with your profile and the game you have selected.
                    </p></li>
                    <li><p>
                        <b>Get invited by an active Friend:</b> We regard users that bring new gamers to
                        our jackpots, therefore any newbie is given the option to invite another player to
                        a jackpot once (even though this option might be renewed through participation in
                        events). When you are invited by a friend a notification will appear in your profile,
                        upon accepting it your status in the jackpot will change to "invited"in the jackpot
                        with the same score as your friend.
                    </p></li>
                </ul>
                <h2>How do I maximize my score?</h2>
                <p>
                    The score assignment depends on the game's standard score which is manually assigned by
                    GameStonks and on the user's actions. THE STANDARD SCORE HAS NOTHING TO DO WITH THE PRICE
                    OF THE GAME. The score assignment algorithm is a secret and might change with time, and
                    you will have to figure out by yourself some strategies to improve your score. However
                    there are some general guidelines you should follow:
                </p>
                <ul>
                    <li><p>
                        <b>Check the GameStonks home page:</b> If we have assigned a bigger standard score
                        for a game we might hint at it in one of our home page entries.
                    </p></li>
                    <li><p>
                        <b>Use a multiplier:</b> Multipliers can be earned by participating in events, each multiplier
                        will have a characteristic effect, you can use no more than three multipliers for J01 jackpots.
                        Participate in GameStonks events, to get the multipliers you want to apply and choose them wisely.
                    </p></li>
                    <li><p>
                        <b>Start early:</b> The more monitored users we have for a game the least is it's score. The more
                        time played you have when we start monitoring the least score you will be awarded.
                    </p></li>
                    <li><p>
                        <b>Don't overdo it:</b> If you happen to own lots of the games we are interested the score you earn
                        from each game might decrease depending on your current number of monitored games.
                    </p></li>
                </ul>
                <h2>How do I get kicked from the jackpot?</h2>
                <p>
                    The fastest way to be kicked from any of our jackpots is by making us waste time or resources.
                    In this jackpot you can get kicked from this jackpot or even temporally banned by doing any of
                    these:
                </p>
            <ul>
                <li><p>
                    <b>Having your profile set to private or only friends:</b> Lots of operations in GameStonks require
                    a public profile, as specified in our <b>Privacy Policy</b> and we only take the information you are
                    willing to offer us. Having a private profile means that you are not willing to participate in any of
                    Gamestonks's jackpots and thus you will be kicked from the jackpot and banned any time you set your profile
                    visibility as private during your participation in a jackpot, your ban will be lifted once you set
                    your profile visibility to public again, but you will not be able to enter the jackpot again.
                </p></li>
                <li><p>
                    <b>Lying about the games you own:</b> If you agree to share information about a game you do
                    not own we will immediately know on using the steam API (as long as your profile is public).
                    If you lie about having a game you will be kicked from the Jackpot and issued a strike.
                </p></li>
                <li><p>
                    <b>Dropping a game while we still have interest in it:</b> It is GameStonks compromise to let
                    an user review all the information we have about them and let them decide if they want to erase
                    any of it, that is why we facilitate the possibility to interrupt the monitoring of any of your
                    games. However, if the games you are dropping are present in this jackpot's features you will be
                    automatically kicked from it.
                    </p></li>
                </ul>
            </article></div>
    )
    }
}

export default J01Doc;