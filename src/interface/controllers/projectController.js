const projectServices = require("../../application/services/projectServices");

class ProjectController{
    async preparePageData(req, res){
        try{    
            const { projectId } = req.params;

            const pageData = await projectServices.preparePageData(projectId);

            res.json()
        }catch(error){
            console.error("Erro no fluxo de preparar a página do projeto:", error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).send(error.message);
        }
    }

    async create(req, res){
        try{
            const {titulo, descricao, dataTermino} = req.body;
            // const user = req.user.id;
            const userId = 1;   
            const newProject = await  projectServices.create({titulo, descricao, dataTermino}, userId);
            res.status(200).json({"Sucess": true, "Result:": newProject});
        }catch(error){
            // Tratar erros aqui
        }
    }

    async inviteMembers(req, res){
        try{
            const { projectId } = req.params; // Id do projeto vindo da URL
            const{  emails, role } = req.body;
            // const inviterId = req.user.id;
            const inviterId = 1;
            
            if (!emails || !Array.isArray(emails) || emails.length === 0) {
                return res.status(400).json({ message: 'A lista de e-mails é obrigatória.' });
            }

            const results = await projectServices.inviteMembersToProject(parseInt(projectId), emails, role, inviterId);
            

            res.status(200).json({ message: 'Convites processados com sucesso.', results });
        }catch(error){
            res.status(error.statusCode || 500 ).json({ Where: "ProjectController->inviteMembers", message: error.message});
        }
    }
}

module.exports = new ProjectController();