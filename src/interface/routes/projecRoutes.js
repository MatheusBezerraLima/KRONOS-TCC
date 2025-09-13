const express = require('express');
const projectController = require('../controllers/projectController');
const routes = express.Router();
const verifyAuthToken = require('../middlewares/authenticateToken');

routes.post('/projetos', verifyAuthToken, projectController.create);

routes.post('/:projectId/invites', verifyAuthToken, projectController.inviteMembers);

module.exports = routes;