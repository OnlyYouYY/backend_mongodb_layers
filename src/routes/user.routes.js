const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController.js');

router.get('/', UserController.getAllReactions);

router.post('/createReaction', UserController.createReaction);

router.get('/newModel', UserController.getNewUsers);

router.get('/newModel2', UserController.getUsersByStatus);


module.exports = router;