const Color = require('../models/colors.js');

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

module.exports = {
    getAllColors,
    createColor
}