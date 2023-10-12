const Message = require('../models/message.js');

async function getAllMessage() {
    try {
        const messages = await Message.find();
        return messages;
    } catch (error) {
        throw error;
    }
}

async function createMessage(messageData){
    try {
        const newMessage = new Message(messageData);
        return await newMessage.save();
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllMessage,
    createMessage
}