const express = require('express');
const inviteController = require('../controllers/inviteController');
const verifyAuthToken = require('../middlewares/authenticateToken');
const routes = express.Router();


routes.get('/accept', verifyAuthToken, inviteController.acceptInvite);


module.exports = routes;

