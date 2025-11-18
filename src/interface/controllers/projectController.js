const projectServices = require("../../application/services/projectServices");

class ProjectController{
    async listProjects(req, res){
        // const userId = req.user.id;
        const userId = 3;

        const projects = await projectServices.listProjectsForUser(userId);

        res.status(200).json({ Projetos: projects});
    }

    async preparePageData(req, res){
        try{    
            const { projectId } = req.params;

            const pageData = await projectServices.preparePageData(projectId);

            res.json(pageData)
        }catch(error){
            console.error("Erro no fluxo de preparar a página do projeto:", error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).send(error.message);
        }
    }

    async getSprintViewData(req, res) {
        try {
            const { projectId } = req.params;

            const sprintViewData = await projectServices.prepareSprintViewData(parseInt(projectId));
            
            res.status(200).json(sprintViewData);
        } catch (error) {
            console.error("Erro no Controller ao buscar dados da Sprint View:", error.message);
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async create(req, res){
        try{
            const {titulo, descricao, dataTermino} = req.body;
            // const user = req.user.id;
            const userId = 3;   
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
            const inviterId = 3;
            
            if (!emails || !Array.isArray(emails) || emails.length === 0) {
                return res.status(400).json({ message: 'A lista de e-mails é obrigatória.' });
            }

            const results = await projectServices.inviteMembersToProject(parseInt(projectId), emails, role, inviterId);
            

            res.status(200).json({ message: 'Convites processados com sucesso.', results });
        }catch(error){
            res.status(error.statusCode || 500 ).json({ Where: "ProjectController->inviteMembers", message: error.message});
        }
    }

    async addMember(req, res){
        try{
            const { projectId } = req.params;
            console.log(projectId);
                     
            const { userIdToAdd, role } = req.body; 
            // const currentUserId = req.user.id;
            const currentUserId = 3;

            if (!userIdToAdd) {
                return res.status(400).json({ message: 'O ID do usuário a ser adicionado é obrigatório.' });
            }

            const newMember = await projectServices.addMember(
                parseInt(projectId), 
                userIdToAdd, 
                currentUserId, 
                role
            );

              res.status(201).json({ message: 'Membro adicionado com sucesso!', data: newMember });

        } catch (error) {
            console.error("Erro no ProjectController -> addMember:", error.message);
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}

module.exports = new ProjectController();