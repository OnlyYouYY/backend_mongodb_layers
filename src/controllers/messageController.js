const MessageBussinessLogic = require('../../bussinessLogic/messageBussinessLogic');

async function getAllMessage(req, res){
    try {
        const messages = await MessageBussinessLogic.getAllMessage();
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Error al obtener las frases.'});

    }
}

async function createMessage(req, res){
    try {
        const messageData = req.body;
        const newMessage = await MessageBussinessLogic.createMessage(messageData);
        res.status(200).json(newMessage);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Error al crear la frase.'});
        
    }
}

module.exports = {
    getAllMessage,
    createMessage
}