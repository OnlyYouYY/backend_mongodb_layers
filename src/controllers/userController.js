const UserBussinessLogic = require("../../bussinessLogic/userBussinessLogic.js");
const User = require("../../models/user.js");
const Color = require("../../models/colors.js");
const Message = require("../../models/message.js");
const Knowledge = require("../../models/knowledge.js");
const regression = require('ml-regression');
const tf = require('@tensorflow/tfjs-node');
const MarkovChain = require('markovchain');


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


async function obtenerDatosEntrenamientoNeuronal() {
    try {
        // Consultar registros de la base de datos
        const registros = await User.find({}, 'date');

        // Contar la cantidad de registros por día
        const conteoPorDia = {};
        registros.forEach(registro => {
            const fecha = registro.date.toISOString().split('T')[0]; // Obtener la fecha en formato 'YYYY-MM-DD'
            conteoPorDia[fecha] = (conteoPorDia[fecha] || 0) + 1;
        });

        // Convertir los datos a un formato adecuado para el modelo
        const datosEntrenamiento = [];
        Object.keys(conteoPorDia).forEach((fecha, index) => {
            const x = index + 1; // Días representados como números enteros
            const y = conteoPorDia[fecha];
            datosEntrenamiento.push({ x, y });
        });

        return datosEntrenamiento;
    } catch (error) {
        console.error('Error al obtener datos de entrenamiento:', error);
        return [];
    }
}

async function predicted(req, res) {
    try {
        const datosEntrenamiento = await obtenerDatosEntrenamientoNeuronal();

        // Normalizar datos de entrada (solo para ejemplo, ajusta según sea necesario)
        const maxValorY = Math.max(...datosEntrenamiento.map(dato => dato.y));
        const datosNormalizados = datosEntrenamiento.map(dato => ({ x: dato.x, y: dato.y / maxValorY }));

        const tensoresY = tf.tensor2d(datosNormalizados.map(dato => dato.y), [datosNormalizados.length, 1]);

        const modelo = tf.sequential();
        modelo.add(tf.layers.dense({ units: 1, inputShape: [1], activation: 'linear' }));
        modelo.compile({ optimizer: tf.train.adam(), loss: 'meanSquaredError' });

        // Ajustar la tasa de aprendizaje según sea necesario
        const historiaEntrenamiento = await modelo.fit(tensoresY, tensoresY, {
            epochs: 100, learningRate: 0.01, callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1} / 100 - loss: ${logs.loss}`);
                },
            }
        });

        const cantidadPredicciones = 5;
        const prediccionesBasadasEnY = [];
        let entradaPrediccion = tensoresY.slice([tensoresY.shape[0] - 1, 0], [1, tensoresY.shape[1]]); // Utiliza la última entrada para empezar

        for (let i = 0; i < cantidadPredicciones; i++) {
            const yPrediccionNormalizada = modelo.predict(entradaPrediccion).dataSync()[0];
            const yPrediccion = yPrediccionNormalizada * maxValorY; // Desnormalizar la predicción
            prediccionesBasadasEnY.push({ x: datosEntrenamiento.length + i + 1, y: yPrediccion });

            // Actualiza la entrada para la siguiente predicción
            entradaPrediccion = tf.tensor2d([yPrediccion / maxValorY], [1, 1]);
        }

        res.json({ datosEntrenamiento, prediccionesBasadasEnY, historiaEntrenamiento });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al entrenar el modelo.' });
    }
}



//Cadenas de markov

async function obtenerDatosEntrenamiento2() {
    try {
        const registros = await User.find({}, 'date');
        const estados = clasificarDias(registros);
        return estados;
    } catch (error) {
        console.error('Error al obtener datos de entrenamiento:', error);
        return [];
    }
}

function clasificarDias(registros) {
    const estados = [];

    registros.forEach(registro => {
        const fecha = registro.date.toISOString().split('T')[0];
        const estadoExistente = estados.find(estado => estado.fecha === fecha);

        if (estadoExistente) {
            estadoExistente.cantidadPersonas++;
        } else {
            const nuevoEstado = {
                fecha,
                cantidadPersonas: 1,
            };
            estados.push(nuevoEstado);
        }
    });

    estados.forEach(estado => {
        if (estado.cantidadPersonas < 10) {
            estado.estado = 'Bajo tráfico';
        } else if (estado.cantidadPersonas >= 10 && estado.cantidadPersonas <= 30) {
            estado.estado = 'Tráfico moderado';
        } else {
            estado.estado = 'Alto tráfico';
        }
    });

    return estados;
}

function construirCadenaMarkov(estados) {
    const matrizTransicion = {};

    for (let i = 0; i < estados.length - 1; i++) {
        const estadoActual = estados[i].estado;
        const estadoSiguiente = estados[i + 1].estado;

        if (!matrizTransicion[estadoActual]) {
            matrizTransicion[estadoActual] = {};
        }

        if (!matrizTransicion[estadoActual][estadoSiguiente]) {
            matrizTransicion[estadoActual][estadoSiguiente] = 1;
        } else {
            matrizTransicion[estadoActual][estadoSiguiente]++;
        }
    }

    // Normalizar las transiciones
    Object.keys(matrizTransicion).forEach(estado => {
        const totalTransiciones = Object.values(matrizTransicion[estado]).reduce((acc, count) => acc + count, 0);
        Object.keys(matrizTransicion[estado]).forEach(sigEstado => {
            matrizTransicion[estado][sigEstado] /= totalTransiciones;
        });
    });

    return matrizTransicion;
}

function predecirConCadenaMarkov(matrizTransicion, estadoInicial, pasos) {
    let estadoActual = estadoInicial;
    const predicciones = [{ x: 1, estado: estadoInicial }];

    for (let paso = 0; paso < pasos; paso++) {
        const transiciones = matrizTransicion[estadoActual];

        if (transiciones) {
            const estadosPosibles = Object.keys(transiciones);
            const probabilidadAleatoria = Math.random();
            let acumuladorProbabilidades = 0;

            for (let i = 0; i < estadosPosibles.length; i++) {
                const sigEstado = estadosPosibles[i];
                acumuladorProbabilidades += transiciones[sigEstado];

                if (probabilidadAleatoria <= acumuladorProbabilidades) {
                    estadoActual = sigEstado;
                    predicciones.push({ x: predicciones.length + 1, estado: estadoActual });
                    break;
                }
            }
        } else {
            break;
        }
    }

    return predicciones;
}

async function construirCadenaMarkovMain(req, res) {
    try {
        const estados = await obtenerDatosEntrenamiento2();
        const matrizTransicion = construirCadenaMarkov(estados);

        const estadoInicial = estados[estados.length - 1].estado;
        const pasos = 5; // Puedes ajustar la cantidad de pasos según sea necesario

        const prediccionesMarkov = predecirConCadenaMarkov(matrizTransicion, estadoInicial, pasos);

        res.json({ estados, prediccionesMarkov });
    } catch (error) {
        console.error('Error:', error);
    }
}

/*mongo
//Redes Bayesianas

async function obtenerDatosEntrenamiento() {
    try {
        const registros = await User.find({}, 'date');
        const estados = clasificarDias2(registros);
        return estados;
    } catch (error) {
        console.error('Error al obtener datos de entrenamiento:', error);
        return [];
    }
}

function clasificarDias2(registros) {
    const estados = [];

    registros.forEach(registro => {
        const fecha = registro.date.toISOString().split('T')[0];
        const estadoExistente = estados.find(estado => estado.fecha === fecha);

        if (estadoExistente) {
            estadoExistente.cantidadPersonas++;
        } else {
            const nuevoEstado = {
                fecha,
                cantidadPersonas: 1,
            };
            estados.push(nuevoEstado);
        }
    });

    estados.forEach(estado => {
        if (estado.cantidadPersonas < 10) {
            estado.estado = 'Bajo tráfico';
        } else if (estado.cantidadPersonas >= 10 && estado.cantidadPersonas <= 30) {
            estado.estado = 'Tráfico moderado';
        } else {
            estado.estado = 'Alto tráfico';
        }
    });

    return estados;
}

function construirRedBayesiana(estados) {
    const redBayesiana = {};

    // Definir variables relevantes para la red bayesiana
    const variables = ['diaSemana', 'estacionAnio', 'esFestivo', 'cantidadPersonas'];

    // Construir nodos y relaciones en la red bayesiana
    variables.forEach(variable => {
        redBayesiana[variable] = {
            padre: [], // Nodos padres
            probabilidad: {}, // Tabla de probabilidad condicional
        };
    });

    // Asignar relaciones y probabilidades condicionales
    estados.forEach(estado => {
        // Simplemente como ejemplo, podrías asignar relaciones basadas en el día de la semana
        const diaSemana = obtenerDiaSemana(estado.fecha);

        redBayesiana['diaSemana'].padre.push('cantidadPersonas');
        redBayesiana['diaSemana'].probabilidad[diaSemana] = redBayesiana['diaSemana'].probabilidad[diaSemana] || {};
        redBayesiana['diaSemana'].probabilidad[diaSemana][estado.estado] = (redBayesiana['diaSemana'].probabilidad[diaSemana][estado.estado] || 0) + 1;
    });

    // Normalizar las probabilidades condicionales
    variables.forEach(variable => {
        if (redBayesiana[variable].padre.length > 0) {
            redBayesiana[variable].padre.forEach(padre => {
                const probabilidadPadre = redBayesiana[variable].probabilidad[padre];

                if (probabilidadPadre) {
                    const sum = Object.values(probabilidadPadre).reduce((acc, val) => acc + val, 0);

                    if (sum !== 0) {
                        Object.keys(probabilidadPadre).forEach(val => {
                            redBayesiana[variable].probabilidad[padre][val] /= sum;
                        });
                    }
                }
            });
        }
    });

    return redBayesiana;
}


function obtenerDiaSemana(fecha) {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fechaObj = new Date(fecha);
    const diaSemana = diasSemana[fechaObj.getDay()];
    return diaSemana;
}

function predecirConRedBayesiana(redBayesiana, fecha) {
    const diaSemana = obtenerDiaSemana(fecha);

    // Inicializar evidencia con el día de la semana
    const evidencia = {
        diaSemana,
    };

    // Realizar inferencia bayesiana para estimar la cantidad de personas
    const predicciones = inferenciaBayesiana(redBayesiana, evidencia, 'cantidadPersonas');

    console.log({ evidencia, predicciones });
}

function inferenciaBayesiana(redBayesiana, evidencia, variableObjetivo) {
    const predicciones = {};

    // Calcular la probabilidad marginal de la variable objetivo
    Object.keys(redBayesiana[variableObjetivo].probabilidad).forEach(valor => {
        let probabilidad = 1;

        // Multiplicar las probabilidades condicionales
        redBayesiana[variableObjetivo].padre.forEach(padre => {
            const valorPadre = evidencia[padre];
            probabilidad *= redBayesiana[variableObjetivo].probabilidad[padre][valorPadre] || 0;
        });

        // Multiplicar por la probabilidad de la variable objetivo dada la evidencia
        probabilidad *= redBayesiana[variableObjetivo].probabilidad[valor][evidencia[variableObjetivo]] || 0;

        predicciones[valor] = probabilidad;
    });

    // Normalizar las predicciones
    const sumProbabilidades = Object.values(predicciones).reduce((acc, val) => acc + val, 0);
    Object.keys(predicciones).forEach(valor => {
        predicciones[valor] /= sumProbabilidades;
    });

    return predicciones;
}

async function redesBayesianasMain(req, res) {
    try {
        const estados = await obtenerDatosEntrenamiento();
        const redBayesiana = construirRedBayesiana(estados);

        const fecha = '2023-08-12'; // Reemplaza con la fecha para la que quieres hacer la predicción

        res.json(predecirConRedBayesiana(redBayesiana, fecha));
    } catch (error) {
        console.error('Error:', error);
    }
}
*/



module.exports = {
    getAllReactions,
    createReaction,
    getNewUsers,
    getUsersByStatus,
    duplicateUserData,
    getHourlyData,
    predicted,
    construirCadenaMarkovMain,
    //redesBayesianasMain
};
