const { Sprint } = require("../models/index");

class SprintDAO {
    async findByProjectAndNumber(projectId, sprintNumber) {
        try {
            return await Sprint.findOne({
                where: {
                    projeto_id: projectId,
                    sprint_number: sprintNumber
                }
            });
        } catch (error) {
            console.error(`Erro no DAO ao buscar sprint ${sprintNumber} para o projeto ${projectId}:`, error);
            throw error;
        }
    }

 
    async create(projectId, sprintNumber, dates) {
        try {
            return await Sprint.create({
                projeto_id: projectId,
                sprint_number: sprintNumber,
                start_date: dates.sprintStartDate,
                end_date: dates.sprintEndDate,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } catch (error) {
            console.error(`Erro no DAO ao criar sprint ${sprintNumber} para o projeto ${projectId}:`, error)
            throw error;
        }
    }

      async findAllByProjectId(projectId) {
        try {
            return await Sprint.findAll({
                where: {
                    projeto_id: projectId
                },
                order: [
                    ['sprint_number', 'ASC'] 
                ]
            });
        } catch (error) {
            console.error(`Erro no DAO ao buscar sprints para o projeto ${projectId}:`, error);
            throw error;
        }
    }
}

module.exports = new SprintDAO();