const express = require("express");
const routes = express.Router();
const AdminController = require("../controllers/adminController");
const verifyIsAdmin = require('../middlewares/authorizeAdmin'); 

routes.get("/users", verifyIsAdmin,AdminController.listAllUsers);

routes.delete("/users/:userId", verifyIsAdmin, AdminController.deleteUser);

routes.get("/promote-user/:userId", verifyIsAdmin, AdminController.promoteUserRenderForm);

routes.put("/users/:userId", verifyIsAdmin, AdminController.updateUser);

module.exports = routes;