var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var moment = require('moment');
var indexRouter = require('./routes/index');



var bodyParser = require('body-parser');
var app = express();

//给EJS传入函数格式化日期;
app.locals.dateFormat = function(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}
var mongoose = require('mongoose');

global.dbHandel = require('./database/dbHandel');
global.db = mongoose.connect("mongodb://127.0.0.1:27017/nodedb",{useNewUrlParser:true},function(err){
  if(!err)console.log('数据库连接成功...');
});
app.use(session({
  secret:'secret',
  cookie:{
    maxAge:1000*60*30,
  }
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', indexRouter);


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
