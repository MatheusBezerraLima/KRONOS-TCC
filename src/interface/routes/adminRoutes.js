const express = require("express");
const routes = express.Router();
const path = require("path");
const AdminController = require("../controllers/adminController");

routes.get("/users", AdminController.listAllUsers);

routes.delete("/users/:userId", AdminController.deleteUser)

routes.get("/promote-user/:userId", AdminController.promoteUserRenderForm);

routes.put("/users/:userId", AdminController.updateUser);

module.exports = routes;