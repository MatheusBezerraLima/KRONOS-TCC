 const express = require('express');
const routes = express.Router();
const verifyAuthToken = require('../middlewares/authenticateToken');
const subTaskController = require('../controllers/subTaskController');
// const createTaskSchema = require('../validators/taskValidator');
// const validate = require('../middlewares/validate');

// Rota para criar uma subtarefa dentro de uma tarefa
// POST /tasks/123/subtasks

routes.post('/tasks/:taskId/subtasks', verifyAuthToken, subTaskController.create);

// Rota para atualizar (renomear, mudar status) uma subtarefa
// PATCH /subtasks/456
routes.patch('/subtasks/:subTaskId', verifyAuthToken, subTaskController.update);

// Rota para apagar uma subtarefa
// DELETE /subtasks/456
routes.delete('/subtasks/:subTaskId', verifyAuthToken, subTaskController.delete);

module.exports = routes;