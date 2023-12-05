const UserBussinessLogic = require("../../bussinessLogic/userBussinessLogic.js");
const User = require("../../models/user.js");
const Color = require("../../models/colors.js");
const Message = require("../../models/message.js");
const Knowledge = require("../../models/knowledge.js");
const regression = require('ml-regression');
const tf = require('@tensorflow/tfjs-node');

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

        res.json({ totalUsers, statusStats: statusStatsWithPercentage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios con campos reemplazados.' });
    }
}

function fibonacci(limit) {
    const sequence = [0, 1];
    for (let i = 2; i <= limit; i++) {
        sequence[i] = sequence[i - 1] + sequence[i - 2];
    }
    return sequence;
}

async function duplicateUserData(req, res) {
    try {

        const limit = 3
        ;
        const fibonacciSequence = fibonacci(limit);

        const users = await User.find();

        for (const multiplier of fibonacciSequence) {
            for (const user of users) {
                const duplicatedUser = new User({
                    ip: user.ip,
                    date: user.date,
                    textColor: user.textColor,
                    textBackground: user.textBackground,
                    message: user.message,
                    reaction: user.reaction,
                    couple: user.couple,
                    gender: user.gender,
                });

                await duplicatedUser.save();
            }
        }

        console.log('Datos duplicados exitosamente.');
        res.status(200).json({ message: 'Datos duplicados exitosamente.' });
    } catch (error) {
        console.error('Error al duplicar los datos:', error);
        res.status(500).json({ error: 'Error al duplicar los datos.' });
    }
}

async function getHourlyData(req, res) {
    try {

        const latestDateEntry = await User.findOne({}, { date: 1 }, { sort: { date: -1 } });

        if (!latestDateEntry) {
            return res.json({ maxRegisteredHours: [] });
        }

        const latestDate = latestDateEntry.date;

        const startDate = new Date(latestDate);
        startDate.setDate(startDate.getDate() - 8);

        const usersWithinRange = await User.find({
            date: { $gte: startDate, $lte: latestDate },
        }).sort({ date: 1 });

        const maxRegisteredHourMap = new Map();

        usersWithinRange.forEach(user => {
            const date = new Date(user.date);

            date.setHours(date.getHours() + 4);

            const hora = date.getHours();
            const fecha = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

            if (!maxRegisteredHourMap.has(fecha) || maxRegisteredHourMap.get(fecha).count < maxRegisteredHourMap.get(fecha).count) {
                maxRegisteredHourMap.set(fecha, { hora, count: 1 });
            } else {
                maxRegisteredHourMap.get(fecha).count += 1;
            }
        });

        const maxRegisteredHours = [...maxRegisteredHourMap].map(([fecha, { hora, count }]) => {
            return { fecha, hora, "Total registrados": count };
        });

        res.json({ maxRegisteredHours });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al encontrar la hora con más registros por día.' });
    }
}

async function calculateMaxRegisteredHours() {
    try {
        // Encuentra la última fecha de un dato registrado
        const latestDateEntry = await User.findOne({}, { date: 1 }, { sort: { date: -1 } });

        // Si no hay datos, retorna un objeto con un arreglo vacío
        if (!latestDateEntry) {
            return { maxRegisteredHours: [] };
        }

        // Obtiene la fecha más reciente
        const latestDate = latestDateEntry.date;

        // Calcula la fecha de inicio (5 días antes de la última fecha)
        const startDate = new Date(latestDate);
        startDate.setDate(startDate.getDate() - 6);

        // Encuentra los usuarios con fechas dentro del rango especificado y ordénalos por fecha
        const usersWithinRange = await User.find({
            date: { $gte: startDate, $lte: latestDate },
        }).sort({ date: 1 });

        // Mapa para almacenar la hora con más registros por día
        const maxRegisteredHourMap = new Map();

        // Itera sobre los usuarios y encuentra la hora con más registros para cada día
        usersWithinRange.forEach(user => {
            const date = new Date(user.date);

            // Ajusta la hora según tu desfase de zona horaria
            date.setHours(date.getHours() + 4);

            const hora = date.getHours();
            const fecha = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;

            // Verifica si la hora ya está en el mapa y actualiza si tiene más registros
            if (!maxRegisteredHourMap.has(fecha) || maxRegisteredHourMap.get(fecha).count < maxRegisteredHourMap.get(fecha).count) {
                maxRegisteredHourMap.set(fecha, { hora, count: 1 });
            } else {
                maxRegisteredHourMap.get(fecha).count += 1;
            }
        });

        // Convierte el mapa a un arreglo de objetos para la respuesta
        const maxRegisteredHours = [...maxRegisteredHourMap].map(([fecha, { hora, count }]) => {
            return { fecha, hora, "Total registrados": count };
        });

        // Retorna el resultado con la hora con más registros por día
        return { maxRegisteredHours };
    } catch (error) {
        console.error('Error:', error);
        // Retorna un objeto con un arreglo vacío en caso de error
        return { maxRegisteredHours: [] };
    }
}


function generarDatosEntrenamiento(cantidad) {
    const datos = [];
    for (let i = 0; i < cantidad; i++) {
        const x = Math.random() * 10;
        const y = 2 * x + 1 + Math.random();
        datos.push({ x, y });
    }
    return datos;
}

async function predicted(req, res){
    try {
        const datosEntrenamiento = generarDatosEntrenamiento(100);

        
        const tensoresX = tf.tensor2d(datosEntrenamiento.map(dato => dato.x), [datosEntrenamiento.length, 1]);
        const tensoresY = tf.tensor2d(datosEntrenamiento.map(dato => dato.y), [datosEntrenamiento.length, 1]);

        
        const modelo = tf.sequential();
        modelo.add(tf.layers.dense({ units: 1, inputShape: [1] }));
        modelo.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
        modelo.fit(tensoresX, tensoresY, { epochs: 100 })
            .then(info => {
                console.log('Entrenamiento completado');
            });

        
        const cantidadPredicciones = 3;
        const prediccionesAleatorias = [];
        for (let i = 0; i < cantidadPredicciones; i++) {
            const xPrediccion = Math.random() * 10;
            const yPrediccion = modelo.predict(tf.tensor2d([xPrediccion], [1, 1])).dataSync()[0];
            prediccionesAleatorias.push({ x: xPrediccion, y: yPrediccion });
        }

        res.json({ datosEntrenamiento, prediccionesAleatorias });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al entrenar el modelo.' });
    }
}





module.exports = {
    getAllReactions,
    createReaction,
    getNewUsers,
    getUsersByStatus,
    duplicateUserData,
    getHourlyData,
    predicted
};
