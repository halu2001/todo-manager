var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');

//リレーションの設定
var User = require('./models/user');
var Todo = require('./models/todo');
User.sync().then(() => {
  Todo.belongsTo(User, {foreignKey: 'createdBy'});
  Todo.sync();
});


//GitHub認証処理
var GitHubStrategy = require('passport-github2').Strategy;
var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'b1b437a1503ebe543fd5';
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'ebec79d56f299419013171b3b57c4b3c95237aa8';
// var GITHUB_CLIENT_ID = 'b6b0c0300faf2edfee1f';
// var GITHUB_CLIENT_SECRET = '365d18c2313bcb16e281862d523d4d8b1e271051';

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  // callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/github/callback' : 'http://localhost:8000/auth/github/callback'
  callbackURL:'https://floating-escarpment-50575.herokuapp.com/auth/github/callback'
},
//認証時にユーザーIDとユーザー名を保管
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.username
      }).then(() => {
        done(null, profile);
      });    });
  }
));
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var todoRouter = require('./routes/todos');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: '1f70774be9e54209', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/todos', todoRouter);


//GitHub認証を行う処理
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
});

//GitHub認証結果処理
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
