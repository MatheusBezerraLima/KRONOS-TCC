const { StatusTask } = require('../models/index');

class StatusTaskDAO {
    async findAllStatusTask(){
        return await StatusTask.findAll();
    }
}

module.exports = new StatusTaskDAO();