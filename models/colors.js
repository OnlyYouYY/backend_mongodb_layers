const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    code: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    }
});

const Color = mongoose.model('Color', colorSchema);

module.exports = Color;