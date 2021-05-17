module.exports = async (req, res, user, successFunction) => {
    /*
    Checks whether the request amount is one of the valid options, if the user has enough cash to make it and if the
    user has too many pending requests. If everything is correct userUpdate is called.
    */
    let {cashOut} = req.body;
    cashOut = Number(cashOut);
    if([5,10,20,25,50,100].includes(cashOut) === false){console.log('invalid');res.status(403).send({Error: "Invalid request option"})}
    else if((user.wealth < cashOut)){console.log('not enough');res.status(403).send({Error: "Not enough cash"})}
    else if(user.requests.length > 2){console.log('too many');res.status(403).send({Error: "Too many pending requests"})}
    else{
        user.requests.push({request_cash: cashOut, request_type: "Steam", request_date: new Date()})
        const requestEvent = [new Date(), "R", "Steam", cashOut];
        res.status(200).send(await successFunction(user, requestEvent, -cashOut, true, req.body.dateParams, true))
    }
}