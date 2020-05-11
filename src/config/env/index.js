'use strict';

var path = require('path');
var _ = require('lodash');
var fs = require('fs');

var all = {
  env: process.env.NODE_ENV,
  root: path.normalize(__dirname + '/../../..'),
  port: process.env.PORT || 9000,
  //mongodb配置
  mongo: {
    options: {
      user: process.env.MONGO_USERNAME || '', 
      pass: process.env.MONGO_PASSWORD || '',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }
  },
  //redis 配置
  redis: {
    host: process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1',
    port: process.env.REDIS_PORT_6379_TCP_PORT || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },
  //是否初始化数据
  seedDB: false,
  session:{
    secrets: 'violet-tools-secret',
  },
  //用户角色种类
  userRoles: ['user'],
  //默认首页图片.
  defaultIndexImage: 'https://upload.jackhu.top/blog/index/default.jpg-600x1500q80',
  //第三方登录配置
  github:{
    clientID: process.env.GITHUB_CLIENT_ID || '42d527c17b032d63fc1d',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '054d0dbf4738556d74224b08383ca970242fbf91',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://violetdeng.com:3000/',
  },
  weibo:{
    clientID: process.env.WEIBO_CLIENT_ID || 'clientID',
    clientSecret: process.env.WEIBO_CLIENT_SECRET || 'clientSecret',
    callbackURL: process.env.WEIBO_CALLBACK_URL || '',
  },
  qq:{
    clientID: process.env.QQ_CLIENT_ID || 'clientID',
    clientSecret: process.env.QQ_CLIENT_SECRET || 'clientSecret',
    callbackURL: process.env.QQ_CALLBACK_URL || '',
  },
  //开启第三方登录
  snsLogins:['github'],
  // 邮箱配置
  mail: {
    username: '695247186@qq.com',
    password: 'vxycarcmxllubdhg'
  }
};

var config = _.merge(all,require('./' + process.env.NODE_ENV + '.js') || {});
module.exports = config;
