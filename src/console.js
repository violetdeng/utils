'use strict';

require('module-alias/register');

// 设置默认环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
const commandLineArgs = require('command-line-args');
var config = require('./config/env');

const optionDefinitions = [
  { name: 'command', alias: 'c', type: String, defaultValue: 'replace' }
];

const options = commandLineArgs(optionDefinitions, { partial: true });

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

switch (options.command) {
  case 'replace':
    require('./console/replace.js').run(options._unknown || []);
    break;
  case 'db':
    require('./console/db.js').run(options._unknown || []);
    break;
  case 'user':
    require('./console/user.js').run(options._unknown || []);
    break;
}
