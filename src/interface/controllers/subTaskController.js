const subTaskService = require('../../application/services/subTaskService');

class SubTaskController {

    async create(req, res) {
        try {
            const { taskId } = req.params;
            const subTaskData = req.body;
            // const currentUserId = req.user.id;
            const currentUserId = 3;
            const newSubTask = await subTaskService.createSubTask(parseInt(taskId), subTaskData, currentUserId);
            res.status(201).json(newSubTask);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const { subTaskId } = req.params;
            const dataToUpdate = req.body;
            // const currentUserId = req.user.id;
            const currentUserId = 3;

            // Esta rota pode ser usada tanto para renomear como para mudar o status
            let updatedSubTask;
            if (dataToUpdate.titulo) {
                updatedSubTask = await subTaskService.renameSubTask(parseInt(subTaskId), dataToUpdate.titulo, currentUserId);
            }
            if (dataToUpdate.status_id !== undefined) {
                updatedSubTask = await subTaskService.updateSubTaskStatus(parseInt(subTaskId), dataToUpdate.status_id, currentUserId);
            }

            res.status(200).json(updatedSubTask);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { subTaskId } = req.params;
            // const currentUserId = req.user.id;
            const currentUserId = 3;
            const result = await subTaskService.deleteSubTask(parseInt(subTaskId), currentUserId);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}

module.exports = new SubTaskController();
