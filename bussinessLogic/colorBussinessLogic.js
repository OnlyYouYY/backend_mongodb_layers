const Color = require('../models/colors.js');
const tinycolor = require('tinycolor2');

async function getAllColors(){
    try {
        const colors = await Color.find();
        return colors;
    }
    catch (error) {
        throw error;
    }
}

async function createColor(colorData){
    try {
        const newColor = new Color(colorData);
        return await newColor.save();
    } catch (error) {
        throw error;
    }
}

function hexToRgb(hex) {
    try {
        const color = tinycolor(hex);
        const rgb = color.toRgb();
        return {
            r: rgb.r,
            g: rgb.g,
            b: rgb.b,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Error al convertir el código hexadecimal a RGB.');
    }
}

async function getRgbColors() {
    try {
        const colors = await Color.find();

        const rgbColors = colors.map(color => ({
            _id: color._id,
            name: color.name,
            rgb: hexToRgb(color.code),
        }));

        return rgbColors;
    } catch (error) {
        console.error(error);
        throw new Error('Error al obtener los colores desde la base de datos.');
    }
}



module.exports = {
    getAllColors,
    createColor,
    getRgbColors,
}