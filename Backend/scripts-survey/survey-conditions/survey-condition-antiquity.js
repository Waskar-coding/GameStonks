//Local schemas
const User = require('../../schemas/schema-user');

//Main function
module.exports = (req, surveyId, condition) => {
    const [conditionName, lowerLimit, upperLimit] = condition;
    return new Promise(async resolve => {
        User.findOne({steamid: req.user.user.steamid})
            .then(user => {
                const today = new Date();
                const userAntiquity = Date.now() - user.joined.getTime();
                console.log(`Antiquity Check: {
                    User epochtime: ${user.joined.getTime()}
                    User antiquity: ${userAntiquity}
                    Lower limit: ${lowerLimit}
                    Upper limit: ${upperLimit}
                }`);
                let status;
                let strikeAction;
                let strikeRegister;
                if(!isNaN(lowerLimit) && !isNaN(upperLimit)){
                    const upperCheck = userAntiquity < upperLimit;
                    const lowerCheck = userAntiquity > lowerLimit;
                    const strikeType = lowerCheck === false? 'S02-A' : 'S02-B';
                    status = upperCheck && lowerCheck? 'success' : 'strike';
                    strikeAction = [today, 'S', strikeType, surveyId];
                    strikeRegister = {strike_type: strikeType, strike_date: today, strike_data: [surveyId]};
                }
                else if(!isNaN(lowerLimit)){
                    status = userAntiquity > lowerLimit? 'success' : 'strike';
                    strikeAction = [today, 'S', 'S02-A', surveyId];
                    strikeRegister = {strike_type: 'S02-A', strike_date: today, strike_data: [surveyId]};
                }
                else if(!isNaN(upperLimit)){
                    status = userAntiquity < upperLimit? 'success' : 'strike';
                    strikeAction = [today, 'S', 'S02-B', surveyId];
                    strikeRegister = {strike_type: 'S02-B', strike_date: today, strike_data: [surveyId]};
                }
                else status = 'success';
                resolve(status === 'strike'?
                    {status: 'strike', strikeAction: strikeAction, strikeRegister: strikeRegister} :
                    {status: 'success'}
                );
            })
            .catch(() => resolve({status: 'server-error'}))
    })
}