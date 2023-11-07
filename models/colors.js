const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

const Color = mongoose.model('Color', colorSchema);

module.exports = Color;