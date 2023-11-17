const UserBussinessLogic = require("../../bussinessLogic/userBussinessLogic.js");
const User = require("../../models/user.js");
const Color = require("../../models/colors.js");
const Message = require("../../models/message.js");
const Knowledge = require("../../models/knowledge.js");

async function getAllReactions(req, res) {
    try {
        const reactions = await UserBussinessLogic.getAllReactions();
        res.status(200).json(reactions);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al obtener las reacciones." });
    }
}

async function createReaction(req, res) {
    try {
        const userData = req.body;
        const newReaction = await UserBussinessLogic.createReaction(userData);
        res
            .status(201)
            .json({ message: "Reacción registrada con éxito", data: newReaction });
    } catch (error) {
        if (error.message === "Ya no puede registrar más reacciones.") {
            res.status(400).json({ error: "Ya no puede registrar más reacciones." });
        } else {
            console.error(error);
            res.status(500).json({ error: "Ha ocurrido un error inesperado." });
        }
    }
}

async function getNewUsers(req, res) {
    try {
        // Obtén los usuarios de la base de datos
        const users = await User.find();

        // Mapea cada usuario y reemplaza los campos requeridos
        const replacedUsers = users.map(async (user) => {
            const { textColor, textBackground, message } = user;

            // Busca el color por código en el modelo Color
            const textColorObj = await Color.findOne({ code: textColor });
            const textBackgroundObj = await Color.findOne({ code: textBackground });

            // Busca el mensaje en el modelo Message
            const messageObj = await Message.findOne({ message });

            // Construye un nuevo objeto de usuario con los campos reemplazados
            return {
                ...user.toObject(),
                textColor: textColorObj ? textColorObj.name : textColor,
                textBackground: textBackgroundObj ? textBackgroundObj.name : textBackground,
                message: messageObj ? messageObj.category : message,
            };
        });

        // Espera a que todas las promesas se resuelvan
        const finalUsers = await Promise.all(replacedUsers);

        // Ahora, realiza la consulta en la colección Knowledge para contar y agrupar por el campo result
        const knowledgeStats = await Knowledge.aggregate([
            {
                $match: {
                    $or: finalUsers.map(user => ({
                        color1: user.textColor,
                        color2: user.textBackground,
                        message: user.message,
                        couple: user.couple, // Agrega couple a la consulta
                        
                    }))
                }
            },
            {
                $group: {
                    _id: '$result',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calcula el total de datos
        const totalData = knowledgeStats.reduce((total, stat) => total + stat.count, 0);

        // Calcula los porcentajes y agrega la propiedad al objeto
        const knowledgeStatsWithPercentage = knowledgeStats.map(stat => ({
            ...stat,
            percentage: (stat.count / totalData) * 100
        }));

        res.json(knowledgeStatsWithPercentage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios con campos reemplazados.' });
    }
}



module.exports = {
    getAllReactions,
    createReaction,
    getNewUsers
};
