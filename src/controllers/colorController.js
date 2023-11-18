const ColorBussinessLogic = require('../../bussinessLogic/colorBussinessLogic');
const tinycolor = require('tinycolor2');
const User = require('../../models/user')


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


async function colorRgb(req, res){
    try {
        const rgbColors = await ColorBussinessLogic.getRgbColors();
        res.json(rgbColors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los colores RGB.' });
    }
}

function mixColors(color1, color2) {
    try {
        const mixedColor = tinycolor.mix(color1, color2);
        const rgb = mixedColor.toRgb();
        return {
            r: rgb.r,
            g: rgb.g,
            b: rgb.b,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Error al mezclar los colores.');
    }
}

async function colorMix(req, res){
    try {
        const { color1, color2 } = req.body;

        const mixedColor = mixColors(color1, color2);

        res.json({ mixedColor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al mezclar los colores.' });
    }
}

function calculateAverageColor(color1, color2) {
    const rgbColor1 = hexToRgb(color1);
    const rgbColor2 = hexToRgb(color2);

    const averageR = Math.floor((rgbColor1.r + rgbColor2.r) / 2);
    const averageG = Math.floor((rgbColor1.g + rgbColor2.g) / 2);
    const averageB = Math.floor((rgbColor1.b + rgbColor2.b) / 2);

    return { r: averageR, g: averageG, b: averageB };
}

function calculateAporteValue(color1, color2) {
    const rgbColor1 = hexToRgb(color1);
    const rgbColor2 = hexToRgb(color2);

    const averageColor = calculateAverageColor(color1, color2);
    const complementColor = mixColors(rgbColor1, rgbColor2);

    const aporteR = Math.abs(complementColor.r - (rgbColor1.r + averageColor.r) / averageColor.r);
    const aporteG = Math.abs(complementColor.g - (rgbColor1.g + averageColor.g) / averageColor.g);
    const aporteB = Math.abs(complementColor.b - (rgbColor1.b + averageColor.b) / averageColor.b);

    return { r: aporteR, g: aporteG, b: aporteB };
}


function hexToRgb(hex) {
    const color = tinycolor(hex).toRgb();
    return { r: color.r, g: color.g, b: color.b };
}

function determineColorMixture(aporteValue, threshold = 10) {
    const sumToColor1 = aporteValue.r + aporteValue.g + aporteValue.b;
    const sumToColor2 = 3 * 255 - sumToColor1;

    if (Math.abs(sumToColor1 - sumToColor2) <= threshold) {
        return 'Indeterminado';
    } else {
        return sumToColor1 < sumToColor2 ? 'Color1' : 'Color2';
    }
}


async function averageColor(req, res){
    try {

        const users = await User.find();

        const mixtureResults = users.map((user) => {
            const { textColor, textBackground } = user;

            try {
                const aporteValue = calculateAporteValue(textColor, textBackground);
                const mixtureResult = determineColorMixture(aporteValue);

                return { textColor, textBackground, aporteValue, mixtureResult };
            } catch (error) {
                return { textColor, textBackground, error: 'Error al calcular el valor de aporte.' };
            }
        });


        res.json({ mixtureResults });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios.' });
    }
}

module.exports = {
    getAllColors,
    createColor,
    colorRgb,
    colorMix,
    averageColor
}