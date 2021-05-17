//Current items context
import React from "react";

export const CurrentItems = React.createContext(0);

//SearchParams context
export const SearchParams = React.createContext({
    error: null,
    sort: 'start',
    order: '1',
    search: "",
    page: 1,
    withSearch: true
});