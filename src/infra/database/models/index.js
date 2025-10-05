const sequelize = require("../../../config/database");

// Carregando os modelos 
const User = require("./User");
const Task = require("./Task");
const StatusTask = require("./StatusTask");
const CategoryTask = require("./CategoryTask");
const ActivityLog = require("./ActivityLog");
const FileTask = require("./FileTask");
const Notificacao = require("./Notificacao");
const ProfileUser = require("./ProfileUser");
const Project = require("./Project");
const UserProjectRole = require("./UserProjectRole");
const assignmentTask = require("./AssignmentTask");
const BoardColumn = require("./BoardColumn");
const ChatProjectMessage = require("./ChatProjectMessage");
const PrivateChat = require("./PrivateChat");
const PrivateMessage = require("./PrivateMessage");
const SubTask = require("./SubTask");
const Friendship = require("./Friendship");
const ProjectInvitations = require('./ProjectInvitations');

const  db = {
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
    Friendship,
    ProjectInvitations
}

const applyAssociations = require("./Associations");
applyAssociations(db); // Definindo as relações

module.exports  = db;
