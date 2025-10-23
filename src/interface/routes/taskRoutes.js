    const express = require('express');
    const routes = express.Router();
    const verifyAuthToken = require('../middlewares/authenticateToken');
    const tasksController = require('../controllers/tasksController');
    const createTaskSchema = require('../validators/taskValidator');
    const validate = require('../middlewares/validate');

    // Renderização
    routes.get('/tasks', verifyAuthToken, tasksController.prepareTasksPageData);

    // Autenticação
    routes.post('/tasks', validate(createTaskSchema), tasksController.createTask)

    routes.put('/tasks/:id', verifyAuthToken, tasksController.updateTask);

    routes.delete('/tasks/:id/delete', tasksController.deleteTask)

    routes.patch('/tasks/:taskId/move', tasksController.moveTask);

    routes.patch('/tasks/:taskId/assign-sprint',
        (req, res, next) => {
        console.log('--- ROTA /assign-sprint ACIONADA ---');
        console.log('Headers recebidos:', JSON.stringify(req.headers, null, 2));
        console.log('Corpo (req.body) recebido ANTES do controller:', JSON.stringify(req.body, null, 2));
        // Se req.body estiver vazio aqui, o problema é 100% no middleware express.json() ou na sua ordem.
        next(); // Passa para o próximo handler (o controller)
    },  tasksController.assignSprint)

    module.exports = routes;