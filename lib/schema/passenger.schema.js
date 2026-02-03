const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    name: String,
    age: Number,
    contact: String
});

module.exports = mongoose.model('Passenger', passengerSchema);
