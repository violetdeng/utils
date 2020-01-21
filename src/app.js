
'use strict';

// 设置默认环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/env');
var path = require('path');
var fs = require('fs');
var Moment = require('moment');
var MomentRange = require('moment-range');
MomentRange.extendMoment(Moment);

// 连接数据库.
mongoose.connect(config.mongo.uri, config.mongo.options);
var modelsPath = path.join(__dirname, 'model');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});
//mongoose promise 风格
mongoose.Promise = global.Promise;

const app = express();

require('./config/express')(app);
// static public
app.use(express.static(__dirname + '/public'));
require('./routes')(app);

// catch 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render('404');
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
