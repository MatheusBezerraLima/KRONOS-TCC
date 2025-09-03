    const express = require('express');
    const routes = express.Router();
    const verifyAuthToken = require('../middlewares/authenticateToken');
    const tasksController = require('../controllers/tasksController');
    const createTaskSchema = require('../validators/taskValidator');
    const validate = require('../middlewares/validate');

    // Renderização
    routes.get('/', verifyAuthToken, async(req,res) => {
        await tasksController.prepareTasksPageData(req, res);
    });

    routes.post('/', verifyAuthToken, validate(createTaskSchema), async(req, res) => {
        await tasksController.createTask(req, res);
    })

    routes.put('/:id', verifyAuthToken, async(req, res) => {
        await tasksController.updateTask(req, res)
    });

    routes.delete('/:id/delete', verifyAuthToken, async(req, res) => {
        await tasksController.deleteTask(req, res);
    })

    module.exports = routes;