const express = require('express');
const projectController = require('../controllers/projectController');
const routes = express.Router();
const verifyAuthToken = require('../middlewares/authenticateToken');
const path = require("path");


routes.get('/projetos/:projectId/', projectController.preparePageData);

// Colocar verificação aqui 
routes.post('/projetos', projectController.create);

// Colocar verificação aqui 
routes.post('/:projectId/invites', projectController.inviteMembers);

routes.post('/projetos/:projectId/membros', projectController.addMember)

routes.get('/projetos/:projectId/sprint-view', projectController.getSprintViewData)

module.exports = routes;