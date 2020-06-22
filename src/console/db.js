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

async function select(model, where) {
  const results = await model.find(where)
  return results
}

async function update(model, where, argv) {
  const commandDefinitions = [
    { name: 'set', type: String, multiple: true },
  ];

  const options = commandLineArgs(commandDefinitions, { argv, partial: true });

  let sets = parseParams(options.set)
  return await model.update(where, sets, {
    multi: true
  })
}

exports.run = function(argv) {
  const commandDefinitions = [
    { name: 'type', alias: 't', type: String, defaultValue: 'select' },
    { name: 'model', alias: 'm', type: String },
    { name: 'where', multiple: true },
  ];

  const options = commandLineArgs(commandDefinitions, { argv, partial: true });

  if (!options.model) {
    console.error('请指定模块-m');
    process.exit(-1);
  }

  let promise
  let model

  try {
    model = mongoose.model(options.model)
  } catch (e) {
    console.error('模块不存在');
    process.exit(-1);
  }

  let wheres = parseParams(options.where);

  switch (options.type) {
    case 'select':
      promise = select(model, wheres, options._unknown || [])
      break;
    case 'update':
      promise = update(model, wheres, options._unknown || [])
      break;
    default:
      process.exit(-1);
  }

  promise.then(function(results) {
    console.log(results)
    process.exit(0)
  }).catch(function(error) {
    console.log(error)
    process.exit(-1)
  })
}
