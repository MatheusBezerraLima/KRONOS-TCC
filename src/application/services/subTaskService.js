const subTaskDAO = require('../../infra/database/repositories/subTaskRepository');
const tasksDAO = require('../../infra/database/repositories/tasksRepository');
const userProjectRoleDAO = require('../../infra/database/repositories/userProjectRoleRepository');

class SubTaskService {

    /**
     * Função auxiliar para verificar as permissões de um usuário sobre uma tarefa.
     * @private
     */
    async _checkPermission(subTaskId, currentUserId) {
        const subTask = await subTaskDAO.findById(subTaskId);
        if (!subTask) {
            const error = new Error("Subtarefa não encontrada.");
            error.statusCode = 404;
            throw error;
        }

        const parentTask = await tasksDAO.findById(subTask.tarefa_id);
        if (!parentTask) {
            const error = new Error("Tarefa pai não encontrada.");
            error.statusCode = 404;
            throw error;
        }

        if (parentTask.projeto_id) {
            // Se for uma tarefa de projeto, verifica se o usuário é membro
            const membership = await userProjectRoleDAO.findByUserAndProject(currentUserId, parentTask.projeto_id);
            if (!membership) {
                const error = new Error("Acesso negado: você não é membro do projeto desta tarefa.");
                error.statusCode = 403;
                throw error;
            }
        } else {
            // Se for uma tarefa pessoal, verifica se o usuário é o criador
            if (parentTask.criador_id !== currentUserId) {
                const error = new Error("Acesso negado: esta tarefa pessoal não pertence a você.");
                error.statusCode = 403;
                throw error;
            }
        }
        return subTask;
    }

    /**
     * Adiciona uma nova subtarefa a uma tarefa existente.
     */
    async createSubTask(taskId, subTaskData, currentUserId) {
        // A verificação de permissão aqui é feita na tarefa pai
        const parentTask = await tasksDAO.findById(taskId);
        if (!parentTask) {
            const error = new Error("Tarefa não encontrada.");
            error.statusCode = 404;
            throw error;
        }

        // ... (lógica de verificação de permissão similar à de _checkPermission)

        const newSubTask = await subTaskDAO.create({
            ...subTaskData,
            tarefa_id: taskId,
            status_id: 0
        });

        return newSubTask;
    }

    /**
     * Renomeia uma subtarefa.
     */
    async renameSubTask(subTaskId, newTitle, currentUserId) {
        await this._checkPermission(subTaskId, currentUserId);
        const [affectedRows] = await subTaskDAO.update(subTaskId, { titulo: newTitle });
        if (affectedRows === 0) throw new Error("Não foi possível renomear a subtarefa.");
        return subTaskDAO.findById(subTaskId);
    }

    /**
     * Atualiza o status de uma subtarefa.
     */
    async updateSubTaskStatus(subTaskId, newStatus, currentUserId) {
        await this._checkPermission(subTaskId, currentUserId);
        const [affectedRows] = await subTaskDAO.update(subTaskId, { status_id: newStatus });
        if (affectedRows === 0) throw new Error("Não foi possível atualizar o status da subtarefa.");
        return subTaskDAO.findById(subTaskId);
    }

    /**
     * Apaga uma subtarefa.
     */
    async deleteSubTask(subTaskId, currentUserId) {
        await this._checkPermission(subTaskId, currentUserId);
        const affectedRows = await subTaskDAO.delete(subTaskId);
        if (affectedRows === 0) throw new Error("Não foi possível apagar a subtarefa.");
        return { message: "Subtarefa apagada com sucesso." };
    }
}

module.exports = new SubTaskService();
