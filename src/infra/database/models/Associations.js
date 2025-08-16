
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
        Notificacao,
        ProfileUser,
        Project,
        UserProjectRole,
        assignmentTask,
        BoardColumn,
        ChatProjectMessage,
        PrivateChat,
        PrivateMessage,
        Friendship
    }  = db;

    // Task --> StatusTask (N:1)
    Task.belongsTo(StatusTask, { foreignKey: "status" });
    StatusTask.hasMany(Task, { foreignKey: "status" });

    // Task --> CategoryTask (N:1)
    Task.belongsTo(CategoryTask, { foreignKey: "categoria" });
    CategoryTask.hasMany(Task, { foreignKey: "categoria" });

    // Task --> User (N:N); 
    Task.belongsToMany(User, { through: assignmentTask, foreignKey: "tarefa_id", otherKey: "usuario_id"});
    User.belongsToMany(Task, {through: assignmentTask, foreignKey: "usuario_id", otherKey: "tarefa_id"});

    // User --> User (N:N)
    User.belongsToMany(User , {  as: 'SentRequestsTo', through: Friendship, foreignKey: "requester_id", otherKey: "addressee_id" });
    User.belongsToMany(User , {  as: 'ReceivedRequestsFrom', through: Friendship, foreignKey: "addressee_id", otherKey: "requester_id" });

    Friendship.belongsTo(User, {
        as: 'Requester', // Apelido para o usuário que enviou o pedido
        foreignKey: 'requester_id'
    });
    
    Friendship.belongsTo(User, {
        as: 'Addressee', // Apelido para o usuário que recebeu o pedido
        foreignKey: 'addressee_id'
    });

    //  Task -->  Project (N:1)
    Task.belongsTo(Project, { foreignKey: "projeto_id" });
    Project.hasMany(Task, { foreignKey: "projeto_id" });

    // ActivityLog --> User (1:N)
    ActivityLog.belongsTo(User, { foreignKey: "usuario_id"});
    User.hasMany(ActivityLog, { foreignKey: "usuario_id"});

    // ActivityLog --> Project (N:1)
    ActivityLog.belongsTo(Project, { foreingnKey: "project_id"});
    Project.hasMany(ActivityLog, { foreingnKey: "project_id" });
    
    // ActivityLog --> Task (N:1)
    ActivityLog.belongsTo(Task, { foreignKey: "tarefa_id" });
    Task.hasMany(ActivityLog, { foreignKey: "tarefa_id" });

    // FileTask  --> Task (N:1)
    FileTask.belongsTo(Task, { foreignKey: "tarefa_id" });
    Task.hasMany(FileTask, { foreignKey: "tarefa_id" });

    // Notificacao  --> User (N:1)
    Notificacao.belongsTo(User, { foreignKey: "usuario_id" });
    User.hasMany(Notificacao, { foreignKey: "usuario_id" });

    //ProfileUser --> User (1:1)
    ProfileUser.belongsTo(User, { foreignKey: "usuario_id" });
    User.hasOne(ProfileUser, { foreignKey: "usuario_id" });

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
    PrivateMessage.belongsTo(User, { foreignKey: "rementente_id"});
    User.hasMany(PrivateMessage, { foreignKey: "rementente_id"});

    // Project --> User (N:1)
    Project.belongsTo(User, { foreignKey: "usuario_id" });
    User.hasMany(Project, { foreignKey: "usuario_id" });

    // SubTask --> Task (N:1)
    SubTask.belongsTo(Task, { foreignKey: "tarefa_id" });
    Task.hasMany(SubTask, { foreignKey: "taarefa_id" }); 
};

module.exports = applyAssociations;