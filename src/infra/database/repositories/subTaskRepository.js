const { SubTask } = require('../models');
const { Op } = require('sequelize');

class SubTaskDAO {
    async create(data) {
        try {
            return await SubTask.create(data);
        } catch (error) {
            console.error('Erro no DAO ao criar subtarefa:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            return await SubTask.findByPk(id);
        } catch (error) {
            console.error(`Erro no DAO ao buscar subtarefa por ID ${id}:`, error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            return await SubTask.update(data, { where: { id } });
        } catch (error) {
            console.error(`Erro no DAO ao atualizar a subtarefa ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            return await SubTask.destroy({ where: { id } });
        } catch (error) {
            console.error(`Erro no DAO ao apagar a subtarefa ${id}:`, error);
            throw error;
        }
    }

    async bulkCreate(subTasksData) {
        try {
            return await SubTask.bulkCreate(subTasksData);
        } catch (error) {
            console.error('Erro no DAO ao criar subtarefas em massa:', error);
            throw error;
        }
    }

    async findAllByTaskIds(taskIds) {
        if (!taskIds || taskIds.length === 0) {
            return [];
        }
        try {
            return await SubTask.findAll({
                where: {
                    tarefa_id: {
                        [Op.in]: taskIds
                    }
                }
            });
        } catch (error) {
            console.error('Erro no DAO ao buscar subtarefas por múltiplos IDs:', error);
            throw error;
        }
    }
}

module.exports = new SubTaskDAO();

