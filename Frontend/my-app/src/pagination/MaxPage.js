import Math from "math";

function findMaxPage(current, display){
    if(current===0){
        return 1;
    }
    else if(current%display!==0){
        return Math.floor(current/display) + 1;
    }
    else{
        return current/display;
    }
}

export default findMaxPage;