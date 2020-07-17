//Imports
////Local
const User = require('../../../object_db/user_db.js');
const checkCurrentRegister = require('../register-update');

//Main function
function mainPersonalJ01(req, res){
    User.findOne({steamid: req.user.user.steamid})
        .then(user => {
            let currentRegister = user.jackpots.filter(jackpot => {
                return jackpot.jackpot_id === req.params.jackpot_id;
            })
            currentRegister = (currentRegister.length > 0)? currentRegister.pop() : null;
            const payload = {
                steamid: user.steamid,
                name: user.name,
                thumbnail: user.thumbnail,
                multipliers: user.multipliers,
                register: currentRegister,
                products: (currentRegister !== null)?
                    user.monitored.filter(product => {
                        return (
                            (currentRegister.products.includes(product.product_id))
                            &&
                            (product.register_type === 'J01')
                        )
                    })
                    :
                    []
            };
            const updatedRegister = (currentRegister !== null)?
                {
                    jackpot_id: currentRegister.jackpot_id,
                    multipliers: currentRegister.multipliers,
                    products: currentRegister.products
                }
                :
                req.cookies.currentRegister;
            checkCurrentRegister(req, res, updatedRegister, payload);
        })
        .catch(() => {
            res.status(505).send({Error: 'Internal server error'})
        })
}
module.exports = mainPersonalJ01;