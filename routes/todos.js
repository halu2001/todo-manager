'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Todo = require('../models/todo');
const User = require('../models/user');

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
router.get('/edit/:todoId', authenticationEnsurer, (req, res, next) => {
  Todo.findOne({
    where: {
      todoId: req.params.todoId,
    },
  }).then((todo) => {
    if (todo && isMine(req, todo)) {
      res.render('edit', { 
        todo: todo,
        user: req.user,
      });
    }else{
      const err = new Error("指定されたtodoは見つからないか、編集する権限がありません");
      err.status = 404;
      next(err);  
    }
  })
});

//todo作成
router.post('/new', authenticationEnsurer, (req, res, next) => {
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
router.post('/delete/:todoId', authenticationEnsurer, (req, res, next) => {
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
router.post('/update/:todoId', authenticationEnsurer, (req, res, next) => {
  var upUser = User.findOne({
    where:{
      userId: req.user.userId
    }
  })
  Todo.findOne({
    where: {
      todoId: req.params.todoId,
    },
  }).then((todo) => {
    const todos = todo;
    if (todo && isMine(req, todo)) {
      todo.update({
        isFinish: !todo.isFinish,
      }).then((todo) => {
        if (todo.isFinish) {
          upUser.totalExperiencePoints ++;
        }else{
          upUser.totalExperiencePoints --;
        }
        if(upUser.totalExperiencePoints >= upUser.nextLevelExperiencePoints){
          upUser.level ++;
          var nexExp = nextExperiencePoints[upUser.level-1];
          upUser.nextExperiencePoints = nexExp;
        }else if(upUser.totalExperiencePoints < upUser.nextLevelExperiencePoints){
          upUser.level --;
          var nexExp = nextExperiencePoints[upUser.level-1];
          upUser.nextExperiencePoints = nexExp;
        }
          upUser.update({
            userId:req.user.userId,
            username:req.user.username,
            totalExperiencePoints:req.user.totalExperiencePoints,
            nextLevelExperiencePoints:req.user.nextLevelExperiencePoints,
            level:req.user.level
          });
          res.redirect("/");
      });
    }else{
      const err = new Error("指定されたtodoは見つからないか、更新する権限がありません");
      err.status = 404;
      next(err);  
    }
  })
});


// //todo更新
// router.post('/update/:todoId', authenticationEnsurer, (req, res, next) => {
//   Todo.findOne({
//     where: {
//       todoId: req.params.todoId,
//     },
//   }).then((todo) => {
//     const todos = todo;
//     if (todo && isMine(req, todo)) {
//       todo.update({
//         isFinish: !todo.isFinish,
//       }).then((todo) => {
//         if (todo.isFinish) {
//           req.user.totalExperiencePoints ++;
//         }else{
//           req.user.totalExperiencePoints --;
//         }
//         if(req.user.totalExperiencePoints >= req.user.nextLevelExperiencePoints){
//           req.user.level ++;
//           req.user.nextExperiencePoints = nextExperiencePoints[(req.user.level-1)]
//         }else if(req.user.totalExperiencePoints <= req.user.nextLevelExperiencePoints){
//           req.user.level ++;
//           req.user.nextExperiencePoints = nextExperiencePoints[(req.user.level-1)]
//         }
//         User.findOne({
//           where: {
//             userId: req.user.id
//           }
//         }).then(user => {
//           user.update({
//             userId:req.user.userId,
//             username:req.user.username,
//             totalExperiencePoints:req.user.totalExperiencePoints,
//             nextLevelExperiencePoints:req.user.nextLevelExperiencePoints,
//             level:req.user.level
//           });
//           res.redirect("/");
//         });
//       });
//     }else{
//       const err = new Error("指定されたtodoは見つからないか、更新する権限がありません");
//       err.status = 404;
//       next(err);  
//     }
//   })
// });

// router.post('/update/:todoId', authenticationEnsurer, (req, res, next) => {
//   Todo.findOne({
//     where: {
//       todoId: req.params.todoId,
//     },
//   }).then((todo) => {
//     const todos = todo;
//     if (todo && isMine(req, todo)) {
//       todo.update({
//         isFinish: !todo.isFinish,
//       }).then((todo) => {
//         res.render('/user/update',{
//           todo: todo,
//           user: req.user,
//         });
//       });
//     }else{
//       const err = new Error("指定されたtodoは見つからないか、更新する権限がありません");
//       err.status = 404;
//       next(err);  
//     }
//   })
// });

//todo編集
router.post('/edit/:todoId', authenticationEnsurer, (req, res, next) => {
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

var nextExperiencePoints = [2,5,10,20,40,80];

  //オブジェクトを保存後にリダイレクト
  // Candidate.bulkCreate(candidates).then(() => {
    // res.redirect('/todos/' + Todo.todoId);
//     res.redirect("/");
//   });
// });

module.exports = router;