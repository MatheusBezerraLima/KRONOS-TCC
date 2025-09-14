const express = require('express');
const projectController = require('../controllers/projectController');
const routes = express.Router();
const verifyAuthToken = require('../middlewares/authenticateToken');

// Colocar verificação aqui 
routes.post('/projetos', projectController.create);
// Colocar verificação aqui 
routes.post('/:projectId/invites', projectController.inviteMembers);

module.exports = routes;