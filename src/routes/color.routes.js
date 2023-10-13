const express = require("express");
const router = express.Router();
const ColorController = require('../controllers/colorController.js');

router.get('/', ColorController.getAllColors);

router.post('/createColor', ColorController.createColor);

module.exports = router;