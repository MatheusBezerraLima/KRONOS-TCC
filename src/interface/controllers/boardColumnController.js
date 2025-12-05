const boardColumnService = require('../../application/services/boardColumnService');

class BoardColumnController {

    async createColumn(req, res) {
        try {
            const { projectId } = req.params;
            console.log("Projeto: ", projectId);
            
            const { columnName } = req.body;
            console.log("Coluna: ", columnName)

            const currentUserId = req.user.id; 
            console.log("USer: ", currentUserId);
            

            if (!columnName) {
                return res.status(400).json({ message: 'O nome da coluna é obrigatório.' });
            }

            const newColumn = await boardColumnService.createColumn(parseInt(projectId), columnName, currentUserId);
            res.status(201).json(newColumn);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async renameColumn(req, res) {
        try {
            const { columnId } = req.params;
            const { newName } = req.body;
            const currentUserId = 3;

            if (!newName) {
                return res.status(400).json({ message: 'O novo nome da coluna é obrigatório.' });
            }

            const updatedColumn = await boardColumnService.renameColumn(parseInt(columnId), newName, currentUserId);
            res.status(200).json(updatedColumn);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async deleteColumn(req, res) {
        try {
            const { columnId } = req.params;
            const currentUserId = 3;

            const result = await boardColumnService.deleteColumn(parseInt(columnId), currentUserId);
            res.status(200).json(result);
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}

module.exports = new BoardColumnController();