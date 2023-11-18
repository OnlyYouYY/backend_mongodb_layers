const express = require("express");
const router = express.Router();
const ColorController = require('../controllers/colorController.js');

router.get('/', ColorController.getAllColors);

router.post('/createColor', ColorController.createColor);

router.get('/rgbColors', ColorController.colorRgb);

router.post('/mixColor', ColorController.colorMix);

router.get('/averageColor', ColorController.averageColor);

module.exports = router;