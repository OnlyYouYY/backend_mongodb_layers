const ColorBussinessLogic = require('../../bussinessLogic/colorBussinessLogic');


async function getAllColors(req, res){
    try {
        const colors = await ColorBussinessLogic.getAllColors();
        res.status(200).json(colors);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Error al obtener los colores'});
    }
}

async function createColor(req, res){
    try {
        const colorData = req.body;
        const newColor = await ColorBussinessLogic.createColor(colorData);
        res.status(200).json(newColor);
    } catch (error) {
        res.status(500).json({error: 'Error al crear el color'});
    }
}

module.exports = {
    getAllColors,
    createColor
}