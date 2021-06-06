'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Todo = require('../models/todo');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

//todo詳細リクエスト
router.get('/:todoId', authenticationEnsurer, (req, res, next) => {
  Todo.findOne({
    where: {
      todoId: req.params.todoId,
    },
  }).then((todo) => {
    if (todo) {
      res.render('todo', { 
        todo: todo,
        user: req.user,
      });
    }else{
      const err = new Error("指定されたtodoは見つかりません");
      err.status = 404;
      next(err);  
    }
  })
});


//todo編集リクエスト
router.get('/edit/:todoId', authenticationEnsurer,csrfProtection, (req, res, next) => {
  Todo.findOne({
    where: {
      todoId: req.params.todoId,
    },
  }).then((todo) => {
    if (todo && isMine(req, todo)) {
      res.render('edit', { 
        todo: todo,
        user: req.user,
        csrfToken: req.csrfToken(),
      });
    }else{
      const err = new Error("指定されたtodoは見つからないか、編集する権限がありません");
      err.status = 404;
      next(err);  
    }
  })
});

//todo作成
router.post('/new', authenticationEnsurer,csrfProtection, (req, res, next) => {
  const todoId = uuid.v4();
  const createdDate = new Date();

  Todo.create({
    todoId: todoId,
    title: req.body.title.slice(0, 255) || '（名称未設定）',
    description: req.body.description,
    createdBy: req.user.id,
    createdDate: createdDate,
    isFinish: false
  }).then((todo) => {
    res.redirect("/");
  });
});

//todo削除
router.post('/delete/:todoId', authenticationEnsurer,csrfProtection, (req, res, next) => {
  Todo.findOne({
    where: {
      todoId: req.params.todoId,
    },
  }).then((todo) => {
    if (todo && isMine(req, todo)) {
      todo.destroy().then((todo) => {
        res.redirect("/");
      });
    }else{
      const err = new Error("指定されたtodoは見つからないか、削除する権限がありません");
      err.status = 404;
      next(err);  
    }
  })
});


//todo更新
router.post('/update/:todoId', authenticationEnsurer,csrfProtection, (req, res, next) => {
  Todo.findOne({
    where: {
      todoId: req.params.todoId,
    },
  }).then((todo) => {
    if (todo && isMine(req, todo)) {
      todo.update({
        isFinish: !todo.isFinish,
      }).then((todo) => {
        res.redirect("/");
      });
    }else{
      const err = new Error("指定されたtodoは見つからないか、更新する権限がありません");
      err.status = 404;
      next(err);  
    }
  })
});

//todo編集
router.post('/edit/:todoId', authenticationEnsurer,csrfProtection, (req, res, next) => {
  Todo.findOne({
    where: {
      todoId: req.params.todoId,
    },
  }).then((todo) => {
    if (todo && isMine(req, todo)) {
      const createdDate = new Date();
      todo.update({
        todoId: todo.todoId,
        title: req.body.title,
        description: req.body.description,
        createdBy: req.user.id,
        createdDate: createdDate,
        // isFinish: false
      }).then((todo) => {
        res.redirect("/");
      });
    }else{
      const err = new Error("指定されたtodoは見つからないか、編集する権限がありません");
      err.status = 404;
      next(err);  
    }
  })
});

//リクエストされたtodoの作成者が本人か確認
function isMine(req, todo) {
  return todo && parseInt(todo.createdBy) === parseInt(req.user.id);
}


module.exports = router;