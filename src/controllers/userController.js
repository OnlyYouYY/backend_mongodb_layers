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

        const users = await User.find();

        const replacedUsers = await Promise.all(users.map(async (user) => {
            const { textColor, textBackground, reaction } = user;

            const textColorObj = await Color.findOne({ code: textColor });
            const textBackgroundObj = await Color.findOne({ code: textBackground });

            return {
                ...user.toObject(),
                textColor: textColorObj ? textColorObj.name : textColor,
                textBackground: textBackgroundObj ? textBackgroundObj.name : textBackground,
            };
        }));

        const knowledgeStats = {
            Feliz: 0,
            Infeliz: 0,
        };

        for (const user of replacedUsers) {
            const { textColor, textBackground, couple, reaction } = user;

            const knowledgeEntry = await Knowledge.findOne({
                color1: textColor,
                color2: textBackground,
                couple: couple,
                reaction: reaction,
            });

            if (knowledgeEntry) {
                knowledgeStats.Feliz += knowledgeEntry.result === 'Feliz' ? 1 : 0;
                knowledgeStats.Infeliz += knowledgeEntry.result === 'Infeliz' ? 1 : 0;
            }
        }

        res.json({ totalUsers: replacedUsers.length, knowledgeStats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios con campos reemplazados.' });
    }
}

async function getUsersByStatus(req, res) {
    try {

        const users = await User.find();

        const replacedUsers = await Promise.all(users.map(async (user) => {
            const { textColor, textBackground, reaction, couple } = user;

            const textColorObj = await Color.findOne({ code: textColor });
            const textBackgroundObj = await Color.findOne({ code: textBackground });

            return {
                ...user.toObject(),
                textColor: textColorObj ? textColorObj.name : textColor,
                textBackground: textBackgroundObj ? textBackgroundObj.name : textBackground,
            };
        }));

        const statusStats = {
            'Con Pareja (Feliz)': 0,
            'Con Pareja (Infeliz)': 0,
            'Sin Pareja (Feliz)': 0,
            'Sin Pareja (Infeliz)': 0,
        };

        for (const user of replacedUsers) {
            const { textColor, textBackground, couple, reaction } = user;

            const knowledgeEntry = await Knowledge.findOne({
                color1: textColor,
                color2: textBackground,
                couple: couple,
                reaction: reaction,
            });

            if (knowledgeEntry) {
                const statusKey = `${couple ? 'Con Pareja' : 'Sin Pareja'} (${knowledgeEntry.result})`;
                statusStats[statusKey]++;
            }
        }

        const totalUsers = replacedUsers.length;

        const statusStatsWithPercentage = {};
        Object.keys(statusStats).forEach((key) => {
            statusStatsWithPercentage[key] = {
                count: statusStats[key],
                percentage: (statusStats[key] / totalUsers) * 100,
            };
        });

        res.json({ totalUsers, statusStats: statusStatsWithPercentage, replacedUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios con campos reemplazados.' });
    }
}



module.exports = {
    getAllReactions,
    createReaction,
    getNewUsers,
    getUsersByStatus
};
