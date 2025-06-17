const express = require('express');
const routes = express.Router()
const path = require('path'); 
const { getRegisterUser, getFindById, getAuthenticateUser, getListAllUsers, getChangePasswordUser, getFindByEmail} = require('../controllers/userController');
const verifyAuthToken = require('../middlewares/authenticateToken');
const verifyRole = require('../middlewares/authorizeAdmin');
const validate = require("../middlewares/validate");
const { createUserSchema, loginUserSchema, changePasswordUserSchema, findByNameUserSchema, findByEmailUserSchema} = require("../validators/userValidator");

// Pronta
routes.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/html/login.html'));
})

// Pronta
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

routes.get('/email', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/html/findEmail.html'));
});

routes.post('/email', validate(findByEmailUserSchema), async(req, res) => {
    await getFindByEmail(req, res);
});

// routes.get('/:id', async(req, res) => {
//     await getFindById(req, res);
// })

routes.get('/change-password', async(req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/html/alterPassword.html'));
});

routes.post('/change-password', verifyAuthToken, async(req, res) => {
    await getChangePasswordUser(req, res);
});
 
module.exports = routes;