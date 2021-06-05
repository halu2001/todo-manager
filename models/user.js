'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const User = loader.database.define(
  'users',
  {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    totalExperiencePoints: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    nextLevelExperiencePoints: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    level:{
      type: Sequelize.INTEGER,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

module.exports = User;