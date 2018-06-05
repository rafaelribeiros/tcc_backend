'use strict';

process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://civitaAppUser:p55dGFaNsXj94B7b@civitaapp-shard-00-00-pywii.mongodb.net:27017,civitaapp-shard-00-01-pywii.mongodb.net:27017,civitaapp-shard-00-02-pywii.mongodb.net:27017/civita?ssl=true&replicaSet=civitaApp-shard-0&authSource=admin&retryWrites=true');
mongoose.connection.on('error', (err) => {
  console.log('Mongo error: ' + err);
});

var index = require('route/index');
var users = require('route/users');
var posts = require('route/posts');
var comments = require('route/comments');
var reports = require('route/reports');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/user', users);
app.use('/post', posts);
app.use('/comment', comments);
app.use('/report', reports);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;