const { SubTask } = require('../models');
const { Op } = require('sequelize');

class SubTaskDAO {

    /**
     * Cria uma nova subtarefa.
     * @param {object} data - Os dados para a nova subtarefa (ex: { titulo, tarefa_id, status_id }).
     * @returns {Promise<SubTask>} A instância da subtarefa criada.
     */
    async create(data) {
        try {
            return await SubTask.create(data);
        } catch (error) {
            console.error('Erro no DAO ao criar subtarefa:', error);
            throw error;
        }
    }

    /**
     * Encontra uma subtarefa pelo seu ID.
     * @param {number} id - O ID da subtarefa.
     * @returns {Promise<SubTask|null>} A instância da subtarefa ou null.
     */
    async findById(id) {
        try {
            return await SubTask.findByPk(id);
        } catch (error) {
            console.error(`Erro no DAO ao buscar subtarefa por ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Atualiza uma subtarefa pelo seu ID.
     * @param {number} id - O ID da subtarefa a ser atualizada.
     * @param {object} data - Um objeto com os campos a serem atualizados (ex: { titulo: 'Novo Título' }).
     * @returns {Promise<Array<number>>} Um array com o número de linhas afetadas.
     */
    async update(id, data) {
        try {
            return await SubTask.update(data, { where: { id } });
        } catch (error) {
            console.error(`Erro no DAO ao atualizar a subtarefa ${id}:`, error);
            throw error;
        }
    }

    /**
     * Apaga uma subtarefa pelo seu ID.
     * @param {number} id - O ID da subtarefa a ser apagada.
     * @returns {Promise<number>} O número de linhas apagadas.
     */
    async delete(id) {
        try {
            return await SubTask.destroy({ where: { id } });
        } catch (error) {
            console.error(`Erro no DAO ao apagar a subtarefa ${id}:`, error);
            throw error;
        }
    }

    /**
     * Cria múltiplas subtarefas de uma só vez.
     * @param {Array<object>} subTasksData - Um array de objetos de subtarefa.
     * @returns {Promise<Array<SubTask>>} As instâncias das subtarefas criadas.
     */
    async bulkCreate(subTasksData) {
        try {
            return await SubTask.bulkCreate(subTasksData);
        } catch (error) {
            console.error('Erro no DAO ao criar subtarefas em massa:', error);
            throw error;
        }
    }

    /**
     * Encontra todas as subtarefas que pertencem a uma lista de IDs de tarefas.
     * @param {Array<number>} taskIds - Um array com os IDs das tarefas principais.
     * @returns {Promise<Array<SubTask>>} Uma lista de todas as subtarefas encontradas.
     */
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

