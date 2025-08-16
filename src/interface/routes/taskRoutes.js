const express = require('express');
const routes = express.Router();
const verifyAuthToken = require('../middlewares/authenticateToken');
const tasksController = require('../controllers/tasksController');

// Renderização
routes.get('/', verifyAuthToken, async(req,res) => {
    await tasksController.listGeneralTasks(req, res);
});

routes.post('/', async(req, res) => {
    await tasksController.createTask(req, res);
})

routes.put('/:id', async(req, res) => {
    await tasksController.updateTask(req, res)
});

routes.patch('/:id/delete', async(req, res) => {
    await tasksController.deleteTask(req, res);
})

module.exports = routes;