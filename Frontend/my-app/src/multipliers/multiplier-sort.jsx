//Standard
import React from "react";

//Packages
import Tippy from "@tippy.js/react";
import 'tippy.js/dist/tippy.css';

//Language jsons
import interactiveDict from "../language-display/interactive-classifier.json";


const getClassArrayUser = (multipliers) => {
    return (multipliers.length !== 0) ? multipliers.map(multiplier => {return multiplier.split('_')[0]}) : multipliers
};
export const sortByClass = (multipliers) => {
    const multiplierClassCount = {};
    for(let multiplier of multipliers){
        if(Object.keys(multiplierClassCount).includes(multiplier)){multiplierClassCount[multiplier.split('_')[0]]++}
        else{multiplierClassCount[multiplier.split('_')[0]] = 1}
    }
    return multiplierClassCount;
};
const createList = (multiplierClassCount, useLinks, context) => {
    if(useLinks){
        return Object.keys(multiplierClassCount).map(multiplierClass => {
            return(
                [
                    <Tippy content={interactiveDict['profile-tooltips']['multiplier-link'][context]}>
                        <div>
                            <div style={{display: "inline-block", marginRight: "5px"}}>{multiplierClass}</div>
                            <div style={{display: "inline-block"}}>x{multiplierClassCount[multiplierClass]}</div>
                        </div>
                    </Tippy>,
                    `../../documents/${multiplierClass.toLowerCase()}`
                ]
            )
        });
    }
    else{
        return Object.keys(multiplierClassCount).map(multiplierClass => {
            return(
                <div>
                    <div style={{display: "inline-block", marginRight: "5px"}}>{multiplierClass}</div>
                    <div style={{display: "inline-block"}}>x{multiplierClassCount[multiplierClass]}</div>
                </div>
            )
        })
    }

};

const sortMultipliers = (multipliers, useLinks, context) => {
  return createList(sortByClass(getClassArrayUser(multipliers)),useLinks, context)
};

export default sortMultipliers;