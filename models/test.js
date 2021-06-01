"use strict";
const express = require("express");
const router = express.Router();
const authenticationEnsurer = require("./authentication-ensurer");
const uuid = require("uuid");
const Task = require("../models/task");
const { route } = require(".");
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

router.get("/:taskId", authenticationEnsurer, (req, res, next) => {
  Task.findOne({
    where: {
      taskId: req.params.taskId,
    },
  }).then((task) => {
    if (task) {
      res.render("task", {
        task: task,
        user: req.user,
      });
    } else {
      const err = new Error("指定されたタスクは見つかりません");
      err.status = 404;
      next(err);
    }
  });
});

router.post(
  "/create",
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    const taskId = uuid.v4();
    const updatedAt = new Date();

    Task.create({
      taskId: taskId,
      title: req.body.title.slice(0, 255) || "（名称未設定）",
      description: req.body.description.slice(0, 255) || "",
      isDone: false,
      createdBy: req.user.id,
      updatedAt: updatedAt,
    }).then((task) => {
      res.redirect("/");
    });
  }
);

router.post(
  "/delete/:taskId",
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    Task.findOne({
      where: {
        taskId: req.params.taskId,
      },
    }).then((task) => {
      if (task && isMine(req, task)) {
        task.destroy().then((task) => {
          res.redirect("/");
        });
      } else {
        const err = new Error(
          "指定されたタスクがない、または、削除する権限がありません"
        );
        err.status = 404;
        next(err);
      }
    });
  }
);

router.post(
  "/update/:taskId",
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    const updatedAt = new Date();

    Task.findOne({
      where: {
        taskId: req.params.taskId,
      },
    }).then((task) => {
      if (task && isMine(req, task)) {
        task
          .update({
            isDone: !task.isDone,
          })
          .then((task) => {
            res.redirect("/");
          });
      } else {
        const err = new Error(
          "指定されたタスクがない、または、更新する権限がありません"
        );
        err.status = 404;
        next(err);
      }
    });
  }
);

router.get(
  "/edit/:taskId",
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    Task.findOne({
      where: {
        taskId: req.params.taskId,
      },
    }).then((task) => {
      if (task && isMine(req, task)) {
        res.render("edit", {
          user: req.user,
          task: task,
          csrfToken: req.csrfToken(),
        });
      } else {
        const err = new Error(
          "指定されたタスクがない、または、編集する権限がありません"
        );
        err.status = 404;
        next(err);
      }
    });
  }
);

router.post(
  "/edit/:taskId",
  authenticationEnsurer,
  csrfProtection,
  (req, res, next) => {
    Task.findOne({
      where: {
        taskId: req.params.taskId,
      },
    }).then((task) => {
      if (task && isMine(req, task)) {
        const updatedAt = new Date();
        task
          .update({
            taskId: task.taskId,
            title: req.body.title,
            description: req.body.description,
            createdBy: req.user.id,
            updatedAt: updatedAt,
          })
          .then((task) => {
            res.redirect("/");
          });
      } else {
        const err = new Error(
          "指定されたタスクがない、または、編集する権限がありません"
        );
        err.status = 404;
        next(err);
      }
    });
  }
);

function isMine(req, task) {
  return task && parseInt(task.createdBy) === parseInt(req.user.id);
}

module.exports = router;