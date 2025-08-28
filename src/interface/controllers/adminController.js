const AdminServices = require("../../application/services/adminServices");
const DatabaseErrors = require("../../utils/databaseErrors.js");
const StatusCode = require("../../utils/status-code.js");

class AdminController {

  async listAllUsers(req, res) {
    try {
      const users = await AdminServices.listAllUsers();

      if (!users) {
        res
          .status(StatusCode.OK)
          .json({ message: "Nenhum usuário encontrado" });
      }

       res.render('admin/list-users', { users });
    } catch (err) {
      if (err.code === DatabaseErrors.NO_SUCH_TABLE) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ erro: "A tabela especificada não existe" });
      }
      if (err.code === DatabaseErrors.CONNECTION_LOST) {
        res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ erro: "A conexão com o banco foi perdida" });
      }
      console.error("Erro inesperado ao listar usuários:", err);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ erro: "Erro interno ao buscar usuário" });
    }
  }

  async deleteUser(req, res) {
    try{
      const { userId } = req.params
    
      const result = await AdminServices.deleteUserAccount(userId);


      if (result === null || result === false) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
        
      res.status(204).send();
    }catch(err){
      console.error(err);
    }

  }

  async promoteUserRenderForm(req, res){
    const { userId } = req.params;

    const user = await AdminServices.findUserById(userId);

    if(!user){
      res.status(404).json("Erro ao buscar Usuário");
    }

    res.render("admin/user-update", { user });
  }

  async updateUser(req, res){
    const { userId } = req.params;
    const { nome, email, role } = req.body;
        
    const updateUser = await AdminServices.updateUser(userId, {nome, email, role});
    
    if(!updateUser){
      res.status(404).json("Erro ao atualizar user");
    }

    res.redirect("/admin/users");
  }
}

module.exports = new AdminController();