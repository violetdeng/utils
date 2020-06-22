'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../../config/env');
var auth = require('../auth.service');
var router = express.Router();

// local ---------------------------------

router
  .get('/', auth.snsPassport(), passport.authenticate('local', {
    failureRedirect: '/auth/local/login',
    session: false
  }))
  .get('/login', function(req, res, next) {
    if (req.query.redirect_url) {
      let url = new URL(req.query.redirect_url);
      if (url.hostname === 'violetdeng.com' || url.hostname === 'localhost') {
        req.session.redirectUrl = req.query.redirect_url;
      }
    }
    return res.render('login')
  })
  .post('/login', function (req, res, next) {
    passport.authenticate('local', {
      session: false
    }, function (err, user, redirectURL) {
      var redirectUrl = req.session.redirectUrl || '/';
      var snsmsg = {};
      if (err) {
        snsmsg.msg = err.message;
        snsmsg.msgtype = 'error';
      } else if (!user) {
        snsmsg.msg = '用户名或密码错误，请重试！';
        snsmsg.msgtype = 'error';
      } else {
        snsmsg.msgtype = 'success';
        snsmsg.msg  = '登录成功，欢迎光临！';
        var token = auth.signToken(user._id);
        redirectUrl += '?token=' + token;
        return res.redirect(redirectUrl);
      }
      return res.render('login', snsmsg)
    })(req, res, next);
  });

module.exports = router;
