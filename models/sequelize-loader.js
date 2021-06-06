'use strict';
const Sequelize = require('sequelize');
// const sequelize = new Sequelize('postgres://postgres:postgres@localhost/todo_manager');
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/todo-manager',
  {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};