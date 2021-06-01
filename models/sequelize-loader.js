'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost/todo_manager'
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};