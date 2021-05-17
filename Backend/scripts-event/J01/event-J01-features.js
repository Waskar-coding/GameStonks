//Useful functions
const eventAuthFiltering = require('../defaults/features/event-features-auth-filtering');
const eventNameFiltering = require('../defaults/features/event-features-name-filtering');
const eventSuccess = require('../defaults/features/event-features-success');

//Main function
module.exports = (req, res) => {eventAuthFiltering(req, res, eventNameFiltering, eventSuccess)};
