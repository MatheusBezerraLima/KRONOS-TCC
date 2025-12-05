const express = require('express');
const routes = express.Router()
const path = require('path'); 
const verifyAuthToken = require('../middlewares/authenticateToken');
const validate = require("../middlewares/validate");
const chatController = require('../controllers/chatController')


routes.post('/projetos/:projectId/mensagens', verifyAuthToken, chatController.createMessage);

routes.get('/projetos/:projectId/mensagens', chatController.listByProject);

module.exports = routes;
