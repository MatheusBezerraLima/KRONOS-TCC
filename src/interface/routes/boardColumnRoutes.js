const express = require('express');
const boardColumnController = require('../controllers/boardColumnController');
const routes = express.Router({ mergeParams: true });

routes.post('/',  boardColumnController.createColumn);

routes.patch('/:columnId',  boardColumnController.renameColumn);

routes.delete('/:columnId',  boardColumnController.deleteColumn);


module.exports = routes;