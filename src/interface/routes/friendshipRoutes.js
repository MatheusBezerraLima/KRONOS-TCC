const express = require('express');
const friendshipController = require('../controllers/friendshipController');
const routes = express.Router({ mergeParams: true });
const verifyAuthToken = require('../middlewares/authenticateToken');


routes.post('/', verifyAuthToken, friendshipController.sendFriendRequest); // 🟩

routes.patch('/:otherUserId', verifyAuthToken, friendshipController.respondToRequest); // 🟩

routes.delete('/:otherUserId', verifyAuthToken, friendshipController.deleteFriendship); // 🟩

routes.get('/', verifyAuthToken, friendshipController.findAllFriends); // 🟩

routes.get('/received', verifyAuthToken, friendshipController.listReceivedRequests); // 🟩

routes.get('/sent', verifyAuthToken, friendshipController.listSentRequests); // 🟩

module.exports = routes;