const { toDefaultValue } = require("sequelize/lib/utils");
const sequelize = require("../../../config/database");
const { DataTypes, DatabaseError } = require("sequelize");

const Sprint = sequelize.define("Sprint", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    projeto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'projeto', key: 'id' },
        onDelete: 'CASCADE'
    },
    sprint_number: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    start_date: {
        type: DataTypes.DATE
    },
    end_date: {
        type: DataTypes.DATE
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE
    },
    updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
    }
}, {
    tableName: "sprint",
    timestamps: false
});

module.exports = Sprint;