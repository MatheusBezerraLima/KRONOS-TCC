const express = require('express');
const projectController = require('../controllers/projectController');
const routes = express.Router();


routes.post('/projetos', projectController.create);