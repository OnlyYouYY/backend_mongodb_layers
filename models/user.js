const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  textColor: {
    type: String,
    required: true,
  },
  textBackground: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  reaction: {
    type: Boolean,
    required: true,
  },
  couple: {
    type: Boolean,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
