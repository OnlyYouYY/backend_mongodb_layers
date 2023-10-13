const UserBussinessLogic = require('../../bussinessLogic/userBussinessLogic.js');


async function getAllReactions(req, res){
    try{
        const reactions = await UserBussinessLogic.getAllReactions();
        res.status(200).json(reactions);
    }
    catch (error){
        console.log(error);
        res.status(500).json({error: 'Error al obtener las reacciones.'});

    }
}

async function createReaction(req ,res){
    try{
        const userData = req.body;
        const newReaction = await UserBussinessLogic.createReaction(userData);
        res.status(200).json(newReaction);
    }
    catch (error){
        console.log(error);
        res.status(500).json({error: 'La reaccion ya ha sido registrada, no puede registrar mas de una vez.'});
    }
}


module.exports = {
    getAllReactions,
    createReaction,
}