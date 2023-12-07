const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController.js');

router.get('/', UserController.getAllReactions);

router.post('/createReaction', UserController.createReaction);

router.get('/newModel', UserController.getNewUsers);

router.get('/newModel2', UserController.getUsersByStatus);

router.post('/duplicateModel', UserController.duplicateUserData);

router.get('/conteoDatosFechaHora', UserController.getHourlyData);

router.get('/predicted', UserController.predicted);

router.get('/predictedmarkov', UserController.construirCadenaMarkovMain);

//router.get('/predictedBayesianas', UserController.redesBayesianasMain);


module.exports = router;