'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Todo = loader.database.define(
  'todo',
  {
    todoId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    createdDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    isFinish: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['createdBy']
      }
    ]
  }
);
module.exports = Todo;