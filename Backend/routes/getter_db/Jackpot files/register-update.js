function checkCurrentRegister(req, res, register, payload){
    if(Object.keys(req.cookies).includes('currentRegister')){
        if(req.cookies.currentRegister.jackpot_id === req.params.jackpot_id){
            res.send(payload);
        }
        else{
            updateCurrentRegister(res, register, payload);
        }
    }
    else{
        updateCurrentRegister(res, register, payload);
    }
}
function updateCurrentRegister(res, register, payload){
    res.cookie('currentRegister', register);
    res.send(payload);
}
module.exports = checkCurrentRegister;