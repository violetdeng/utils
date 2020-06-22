'use strict';

require('module-alias/register');

// 设置默认环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var mongoose = require('mongoose');
var config = require('../config/env');
var path = require('path');
var fs = require('fs');
const commandLineArgs = require('command-line-args');

// 连接数据库.
mongoose.connect(config.mongo.uri, config.mongo.options);
var modelsPath = path.join(__dirname, '../model');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});
//mongoose promise 风格
mongoose.Promise = global.Promise;

const UserModel = mongoose.model('User')

function parseParams(param) {
  let params = {}
  if (param) {
    for (let p of param) {
      let pa = p.split('=')
      if (pa.length === 2) {
        params[pa[0]] = pa[1]
      }
    }
  }
  return params
}

async function update(id, column, value, argv) {
  let one = await UserModel.findOne({
    _id: id
  })

  one[column] = value
  return await one.save()
}

exports.run = function(argv) {
  const commandDefinitions = [
    { name: 'id' },
    { name: 'column' },
    { name: 'value' },
  ];

  const options = commandLineArgs(commandDefinitions, { argv, partial: true });

  let promise = update(options.id, options.column, options.value)
  promise.then(function(results) {
    console.log(results)
    process.exit(0)
  }).catch(function(error) {
    console.log(error)
    process.exit(-1)
  })
}
