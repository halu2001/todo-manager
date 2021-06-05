'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Todo = require('../models/todo');
const User = require('../models/user');

router.post('/update', authenticationEnsurer, (req, res, next) => {
  if (todo.isFinish) {
    req.user.totalExperiencePoints ++;
  }else{
    req.user.totalExperiencePoints --;
  }
  User.findOne({
    where: {
      userId: req.user.id
    }
  }).then(user => {
    user.update({
      userId:req.user.userId,
      username:req.user.username,
      totalExperiencePoints:req.user.totalExperiencePoints,
      nextLevelExperiencePoints:req.user.nextLevelExperiencePoints,
      level:req.user.level
    });
    res.redirect("/");
  });
});

var nextExperiencePoints = [2,5,10,20,40,80];

module.exports = router;

