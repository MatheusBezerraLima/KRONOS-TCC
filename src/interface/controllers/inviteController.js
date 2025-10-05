const inviteServices = require("../../application/services/inviteServices");

const SECRET = process.env.SECRET;

class InviteController{
    async acceptInvite(req, res){
        try{
            const { token } = req.query;
            const loggedUser = req.user || null; 
            
            const result = await inviteServices.accept(token, loggedUser);
            
            switch (result.action){
                case "accepted":
                    return res.redirect(`api/projects/${result.data.projectId}?invite_success=true`);
                case 'redirect_login':
                    return res.redirect(`/register?inviteToken=${result.data.inviteToken}`);
                default:
                    return res.status(500).send('Ocorreu um erro inesperado.');
            }

        }catch(error){
            console.error("Erro no fluxo de aceitação de convite:", error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).send(error.message);
        }
    }
}

module.exports = new InviteController();