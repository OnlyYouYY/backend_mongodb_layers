const fs = require('fs');
const csv = require('csv-parser');
const Knowledge = require('../models/knowledge'); // Asegúrate de que la ruta sea correcta


async function importDataFromCSV(csvFilePath) {
    try {
        const data = [];

        // Lee el archivo CSV
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {

                if (!row.color1 || !row.color2 || !row.couple || !row.reaction || !row.result) {
                    console.error('Error: Todos los campos son requeridos.');
                    return;
                }
                // Mapea los datos del CSV a tu modelo de conocimiento
                const knowledgeData = {
                    color1: row.color1,
                    color2: row.color2,
                    couple: row.couple,
                    reaction: row.reaction,
                    result: row.result,
                };

                data.push(knowledgeData);
            })
            .on('end', async () => {
                // Inserta los datos en la base de datos
                await Knowledge.insertMany(data);
                console.log('Importación exitosa.');
            });

    } catch (error) {
        console.error('Error al importar datos:', error);
        throw error;
    }
}
async function getAllKnowledge() {
    try {
        const allKnowledge = await Knowledge.find();
        return allKnowledge;
    } catch (error) {
        console.error("Error al obtener toda la data de conocimiento:", error);
        throw error;
    }
}

module.exports = {
    importDataFromCSV,
    getAllKnowledge
}
