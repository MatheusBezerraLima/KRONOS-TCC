const express = require('express');
const projectController = require('../controllers/projectController');
const routes = express.Router();
const verifyAuthToken = require('../middlewares/authenticateToken');
const path = require("path");

routes.get('/projetos', verifyAuthToken, projectController.listProjects)

routes.get('/projetos/:projectId/', projectController.preparePageData);

// Colocar verificação aqui 
routes.post('/projetos', verifyAuthToken, projectController.create);

// Colocar verificação aqui 
routes.post('/:projectId/invites',verifyAuthToken,  projectController.inviteMembers);

routes.post('/projetos/:projectId/membros', verifyAuthToken, projectController.addMember)

routes.get('/projetos/:projectId/sprint-view', projectController.getSprintViewData)

module.exports = routes;