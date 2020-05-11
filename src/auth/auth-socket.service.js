'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/env');
var jwt = require('jsonwebtoken');
var User = mongoose.model('User');

/** 
 * 验证token
 */
function authToken(io) {
  return io.use(function(socket, next) {
      if (socket.handshake.query && socket.handshake.query.access_token) {
        var token = socket.handshake.query.access_token;
        jwt.verify(token, config.session.secrets, function (err, decoded) {
          if (err) {
            return next(new Error('UnauthorizedError'));
          }
          socket.decoded = decoded;
          next();
        });
      } else {
        next(new Error('UnauthorizedError'));
      }
    })
}
/**
 * 验证用户是否登录
 */
function isAuthenticated(io) {
  return authToken(io)
    .use(function(socket, next) {
      User.findById(socket.decoded._id, function (err, user) {
        //if (err) return res.status(500).send();
        if (!user) return socket.emit('qq')
        socket.user = user;
        next();
      });
    });
}

/**
 * 验证用户权限
 */
function hasRole(io, roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return isAuthenticated(io)
    .use(function meetsRequirements(socket, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        return res.status(403).send();
      }
    });
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
