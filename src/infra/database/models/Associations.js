
// Associação das tabelas do Banco
const applyAssociations = (db) => {

    const  {
        sequelize,
        User,
        Task,
        SubTask,
        StatusTask,
        CategoryTask,
        ActivityLog,
        FileTask,
        Notification,
        ProfileUser,
        Project,
        UserProjectRole,
        assignmentTask,
        BoardColumn,
        ChatProjectMessage,
        PrivateChat,
        PrivateMessage,
        Friendship,
        ProjectInvitations,
        Sprint
    }  = db;


    Project.hasMany(Sprint, { foreignKey: 'projeto_id', as: 'sprints' });
    Sprint.belongsTo(Project, {foreignKey: 'projeto_id', as: 'project'});

    // Task --> StatusTask (N:1)
    Task.belongsTo(StatusTask, { foreignKey: "status_id", as: "statusTask"});
    StatusTask.hasMany(Task, { foreignKey: "status_id" });

    // Task --> BoardColumn (N:1)
    Task.belongsTo(BoardColumn, { foreignKey: "coluna_id" });
    BoardColumn.hasMany(Task, { foreignKey: "coluna_id" });

    // Task - User 
    Task.belongsTo(User, { foreignKey: "criador_id"});
    User.hasMany(Task, { foreignKey: "criador_id"});

    // Task --> CategoryTask (N:1)
    Task.belongsTo(CategoryTask, { foreignKey: "categoria_id", as: "categoryTask" });
    CategoryTask.hasMany(Task, { foreignKey: "categoria_id" });

    // Task --> User (N:N); 
    Task.belongsToMany(User, { through: assignmentTask, foreignKey: "tarefa_id", otherKey: "usuario_id", as: "assignedMembers"});
    User.belongsToMany(Task, {through: assignmentTask, foreignKey: "usuario_id", otherKey: "tarefa_id", as: "assignedTasks"});

    // User --> User (N:N)
    User.belongsToMany(User , {  as: 'Requester', through: Friendship, foreignKey: "requester_id", otherKey: "addressee_id" });
    User.belongsToMany(User , {  as: 'Addressee', through: Friendship, foreignKey: "addressee_id", otherKey: "requester_id" });

    Friendship.belongsTo(User, {
        as: 'Requester', // Apelido para o usuário que enviou o pedido
        foreignKey: 'requester_id'
    });
    
    Friendship.belongsTo(User, {
        as: 'Addressee', // Apelido para o usuário que recebeu o pedido
        foreignKey: 'addressee_id'
    });

    // 1. Um convite pertence a um Projeto
    ProjectInvitations.belongsTo(Project, {
        foreignKey: 'project_id'
    });
    Project.hasMany(ProjectInvitations, {
        foreignKey: 'project_id'
    });

    // 2. Um convite tem um remetente (Inviter) - que é um Usuário
    ProjectInvitations.belongsTo(User, {
        as: 'Inviter', // Apelido para a relação "quem convidou"
        foreignKey: 'inviter_id'
    });

    // Um usuário pode ter enviado vários convites
    User.hasMany(ProjectInvitations, {
        as: 'SentProjectInvitations',
        foreignKey: 'inviter_id'
    });

    //  Task -->  Project (N:1)
    Task.belongsTo(Project, { foreignKey: "projeto_id" });
    Project.hasMany(Task, { foreignKey: "projeto_id" });

    // ActivityLog --> User (1:N)
    ActivityLog.belongsTo(User, { foreignKey: "usuario_id"});
    User.hasMany(ActivityLog, { foreignKey: "usuario_id"});

    // ActivityLog --> Project (N:1)
    ActivityLog.belongsTo(Project, { foreignKey: "project_id"});
    Project.hasMany(ActivityLog, { foreignKey: "project_id" });
    
    // ActivityLog --> Task (N:1)
    ActivityLog.belongsTo(Task, { foreignKey: "tarefa_id" });
    Task.hasMany(ActivityLog, { foreignKey: "tarefa_id" });

    // FileTask  --> Task (N:1)
    FileTask.belongsTo(Task, { foreignKey: "tarefa_id" });
    Task.hasMany(FileTask, { foreignKey: "tarefa_id" });

    // Notification  --> User (N:1)
    Notification.belongsTo(User, { foreignKey: "usuario_id" });
    User.hasMany(Notification, { foreignKey: "usuario_id" });

    //ProfileUser --> User (1:1)
    ProfileUser.belongsTo(User, { foreignKey: "usuario_id" });
    User.hasOne(ProfileUser, { foreignKey: "usuario_id", as: "profile"});

    // UserProjectRole --> User (1:N)
    UserProjectRole.belongsTo(User, {foreignKey: "usuario_id" });
    User.hasMany(UserProjectRole, {foreignKey: "usuario_id" });

    // UserProjectRole --> Project (1:N)
    UserProjectRole.belongsTo(Project, {foreignKey: "projeto_id" });
    Project.hasMany(UserProjectRole, {foreignKey: "projeto_id" });

    // // BoardColumn --> Project (N:1)
    // BoardColumn.belongsTo(Project, { foreignKey: "projeto_id" });
    // Project.hasMany(BoardColumn, { foreignKey: "projeto_id" });

    // ChatProjectMessage --> User  (N:1)
    ChatProjectMessage.belongsTo(User, { foreignKey: "usuario_id" });
    User.hasMany(ChatProjectMessage, { foreignKey: "usuario_id" });

    // ChatProjectMessage --> Project (N:1)
    ChatProjectMessage.belongsTo(Project, { foreignKey: "project_id" });
    Project.hasMany(ChatProjectMessage, { foreignKey: "project_id" });

    // PrivateMessage  --> PrivateChat (N:1);
    PrivateMessage.belongsTo(PrivateChat, { foreignKey: "chat_id"});
    PrivateChat.hasMany(PrivateMessage, { foreignKey: "chat_id"});

    // PrivateChat --> User 1 (N:1)
    PrivateChat.belongsTo(User, { foreignKey: "usuario1_id"});
    User.hasMany(PrivateChat, { foreignKey: "usuario1_id"});

    // PrivateChat --> User 2 (N:1)
    PrivateChat.belongsTo(User, { foreignKey: "usuario2_id"});
    User.hasMany(PrivateChat, { foreignKey: "usuario2_id"});
   
    // PrivateMessage --> User  (N:1)
    PrivateMessage.belongsTo(User, { foreignKey: "remetente_id"});
    User.hasMany(PrivateMessage, { foreignKey: "remetente_id"});

    // Project --> User (N:1)
    Project.belongsTo(User, { foreignKey: "criador_id" });
    User.hasMany(Project, { foreignKey: "criador_id" });

    // SubTask --> Task (N:1)
    SubTask.belongsTo(Task, { foreignKey: "tarefa_id" });
    Task.hasMany(SubTask, { foreignKey: "tarefa_id", as: "subTasks" }); 
};

module.exports = applyAssociations;