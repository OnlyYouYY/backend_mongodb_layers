const knowledgeBussinessLogic = require('../../bussinessLogic/knowledgeBussinessLogic.js');

async function importDataFromCSV(req, res) {
    try {
        console.log(req.file);
        const file = req.file; // Suponiendo que el path del archivo CSV es enviado en el cuerpo de la solicitud

        if (!file) {
            return res.status(400).json({ error: "Se requiere la ruta del archivo CSV." });
        }

        await knowledgeBussinessLogic.importDataFromCSV(file.path);

        res.status(201).json({ message: "Datos importados con éxito." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ha ocurrido un error inesperado al importar los datos." });
    }
}

async function getAllKnowledge(req, res) {
    try {
        const allKnowledge = await knowledgeBussinessLogic.getAllKnowledge();
        res.status(200).json(allKnowledge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener toda la data de conocimiento." });
    }
}

module.exports = {
    importDataFromCSV,
    getAllKnowledge,
};