'use strict';
const express = require('express');
const router = express.Router();
const Todo = require('../models/todo');
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

/* GET home page. */
router.get('/', csrfProtection, (req, res, next) => {
  const title = 'todo管理アプリ';
  if (req.user) {
    Todo.findAll({
      where: {
        createdBy: req.user.id
      },
      order: [['createdDate', 'DESC']]
    }).then(todos => {
      res.render('index', {
        user: req.user,
        todos: todos,
        csrfToken: req.csrfToken(),
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;