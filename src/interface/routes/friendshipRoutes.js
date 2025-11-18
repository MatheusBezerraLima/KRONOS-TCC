const express = require('express');
const friendshipController = require('../controllers/friendshipController');
const routes = express.Router({ mergeParams: true });

routes.post('/', friendshipController.sendFriendRequest); // 🟩

routes.patch('/:otherUserId', friendshipController.respondToRequest); // 🟩

routes.delete('/:otherUserId', friendshipController.deleteFriendship); // 🟩

routes.get('/', friendshipController.findAllFriends); // 🟩

routes.get('/received', friendshipController.listReceivedRequests); // 🟩

routes.get('/sent', friendshipController.listSentRequests); // 🟩





module.exports = routes;