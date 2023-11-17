const mongoose = require('mongoose');

const newUserSchema = new mongoose.Schema({

    textColor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Color',
        required: true,
    },
    textBackground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Color',
        required: true,
    },

    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true,
    },
});

const newUser = mongoose.model('newUser', newUserSchema);

module.exports = newUser;
