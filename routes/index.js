// 'use strict';
// const express = require('express');
// const router = express.Router();
// const Todo = require('../models/todo');
// const User = require('../models/user');

// /* GET home page. */
// router.get('/', (req, res, next) => {
//   const title = 'todo管理アプリ';
//   if (req.user) {
//     Todo.findAll({
//       where: {
//         createdBy: req.user.id
//       },
//       order: [['createdDate', 'DESC']]
//     }).then(todos => {
//       res.render('index', {
//         title: title,
//         user: req.user,
//         todos: todos
//       });
//     });
//   } else {
//     res.render('index', { title: title, user: req.user });
//   }
// });

// module.exports = router;

'use strict';
const express = require('express');
const router = express.Router();
const Todo = require('../models/todo');
const User = require('../models/user');

router.get('/', (req, res, next) => {
  const title = 'todo管理アプリ';
  if (req.user) {
    User.findOne({
      where: {
        userId: req.user.id
      }
    }).then(user =>{
      Todo.findAll({
        where: {
          createdBy: user.userId
        },
        order: [['createdDate', 'DESC']]
      }).then(todos => {
        res.render('index',{
          title: title,
          user: user,
          todos: todos
        });
      });
    });
  }else{
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;