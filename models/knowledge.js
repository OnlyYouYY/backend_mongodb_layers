const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    color1: {
        type: String,
        required: true,
    },
    color2: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    couple: {
        type: Boolean,
        required: true,
    },
    reaction:{
        type: Boolean,
        required: true,
    },
    result: {
        type: String,
        required: true,
    },
});

const Knowledge = mongoose.model('Knowledge', knowledgeSchema);

module.exports = Knowledge;
