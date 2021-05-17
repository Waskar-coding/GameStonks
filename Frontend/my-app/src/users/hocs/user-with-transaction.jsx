//Standard
import React from "react";

//Context
import TransactionContext from "../../context/transaction-context";

//Personal profile transactions
export const withMyTransaction = (
    TransactionComponent, state, profile, list, graph, setProfile, setList, setGraph
) => {
    return (
        <TransactionContext.Provider value={{
            userId: state.steamId, userName: state.name, userThumbnail: state.thumbnail,
            userWealth: profile.wealth, isPersonal: true, setProfile: setProfile, setList: setList,
            setGraph: setGraph, profile: profile, list: list, graph: graph
        }}>
            <TransactionComponent />
        </TransactionContext.Provider>
    )
}

//Other users's profile transactions
export const withUserTransaction = (
    TransactionComponent, state, profile, list, setProfile, setList, handshake, setHandshake
) => {
    return(
        <TransactionContext.Provider value={{
            userId: state.steamId, userName: state.name, userThumbnail: state.thumbnail,
            userWealth: profile.wealth, isPersonal: false, setProfile: setProfile, setList: setList,
            profile: profile,  list: list, handshake: handshake, setHandshake: setHandshake
        }}>
            <TransactionComponent />
        </TransactionContext.Provider>
    )
}