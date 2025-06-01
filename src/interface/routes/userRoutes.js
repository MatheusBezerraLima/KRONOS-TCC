const express = require('express');
const routes = express.Router()
const path = require('path'); 
const { getRegisterUser, getFindById, getAuthenticateUser, getListAllUsers} = require('../controllers/userController');
const verifyAuthToken = require('../middlewares/userAuthenticate')

routes.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/html/login.html'));
})

routes.post('/login', async(req, res) => {
    await getAuthenticateUser(req, res);
})

routes.get('/register', (req , res) => {
    res.sendFile(path.join(__dirname, '../../../public/html/register.html'));
})

routes.post('/register', async (req , res) => {
    await getRegisterUser(req, res);
})

routes.get('/list', verifyAuthToken, async(req, res) => {
    await getListAllUsers(req, res)
})

routes.get('/:id', async(req, res) => {
    await getFindById(req, res);
})
 
module.exports = routes;