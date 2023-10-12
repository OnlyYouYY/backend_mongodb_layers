const User = require('../models/user.js');

async function getAllReactions(){
    try{
        const reactions = await User.find();
        return reactions;
    }
    catch (error){
        throw error;
    }
}

async function createReaction(userData){

    try{
        const existingReaction = await User.findOne({ip: userData.ip});
        if(existingReaction){
            throw new Error('Su reaccion ya ha sido registrada.');
        }

        const newReaction = new User(userData);
        return await newReaction.save();
    }
    catch (error){
        throw error;
    }

}

module.exports = {
    createReaction,
    getAllReactions
}