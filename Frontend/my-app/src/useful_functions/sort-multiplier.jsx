//Standard
import React from "react";

//Packages
import Tippy from "@tippy.js/react";
import 'tippy.js/dist/tippy.css';

//Language jsons
import interactiveDict from "../language-display/interactive-classifier";


const getClassArrayUser = (multipliers) => {
    return (multipliers.length !== 0) ? multipliers.map(multiplier => {return multiplier.split('_')[0]}) : multipliers
};
const sortByClass = (multipliers) => {
    const multiplierClassCount = {};
    for(let multiplier of multipliers){
        if(Object.keys(multiplierClassCount).includes(multiplier)){
            multiplierClassCount[multiplier.split('_')[0]]++;
        }
        else{
            multiplierClassCount[multiplier.split('_')[0]] = 1;
        }
    }
    return multiplierClassCount;
};
const createList = (multiplierClassCount,context) => {
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
};

const sortMultipliers = (multipliers,context) => {
  return createList(sortByClass(getClassArrayUser(multipliers)),context)
};

export default sortMultipliers;