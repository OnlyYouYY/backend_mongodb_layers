const User = require("../models/user.js");

async function getAllReactions() {
  try {
    const reactions = await User.find();
    return reactions;
  } catch (error) {
    throw error;
  }
}

async function createReaction(userData) {
  try {
    const existingReactions = await User.find({ ip: userData.ip });
    if (existingReactions.length >= 3) {
      const errorMessage = "Ya no puede registrar más reacciones.";
      throw new Error(errorMessage);
    }

    const newReaction = new User(userData);
    return await newReaction.save();
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createReaction,
  getAllReactions,
};
