//Importing packages
const mongoose = require('mongoose');

//Event register schema
const EventRegister = mongoose.Schema({
    event_id: String,
    event_class: String,
    event_base_value: {type: Number},
    event_data: Object,
    event_users: Array
});

//Basic product schema
const product = mongoose.Schema({
    product_id: String,
    name: String,
    release: Date,
    thumbnail: String,
    current_events: Array,
    registers: [EventRegister]
});

const Product = mongoose.model('Product', product);
module.exports = Product;
