const { DataTypes, DATE } = require("sequelize");
const sequelize = require("../../../config/database");

const ProjectInvitations = sequelize.define("ProjectInvitations", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    inviter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "usuario",
            key: "id"
        }
    },
    invitee_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    project_id:{
        type: DataTypes.INTEGER,
        references: {
            model: "projeto",
            key: "id"
        }
    },
    status: {
        type: DataTypes.ENUM("pending", "accepted", "declined"),
        allowNull: false,
        defaultValue: 'pending'
    },
    role_to_assign: {
        type: DataTypes.ENUM("Membro", "Administrador"),
        allowNull: false,
        defaultValue: "Membro"
    },
    token: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true
    }
}, {
    tableName: "convites_projeto",
    timestamps: true
});

module.exports = ProjectInvitations;