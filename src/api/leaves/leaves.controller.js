'use strict';

const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const mongoose = require('mongoose');
const moment = require('moment');
const email = require('emailjs');
const Leave = mongoose.model('Leave');
const User = mongoose.model('User');
//var Logs = mongoose.model('Logs');
const compose = require('composable-middleware');
const { check, validationResult } = require('express-validator');
const config = require('../../config/env')


function checkErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ result: -1, errors: errors.array() });
  }
  next();
}

exports.getLeaveList = function () {
  return compose()
    .use([
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      var currentPage = (parseInt(req.query.currentPage) > 0)?parseInt(req.query.currentPage):1;
      var itemsPerPage = (parseInt(req.query.itemsPerPage) > 0)?parseInt(req.query.itemsPerPage):10;
      var startRow = (currentPage - 1) * itemsPerPage;

      var sortName = String(req.query.sortName) || "created";
      var sortOrder = req.query.sortOrder;
      if(sortOrder === 'false'){
        sortName = "-" + sortName;
      }

      var userId = req.user._id;

      var query = Leave.find({ userId: userId });

      query.countAsync().then(function (count) {
        return Leave.find({ userId: userId })
          //.skip(startRow)
          //.limit(itemsPerPage)
          //.sort(sortName)
          .exec().then(function (leaveList) {
            return res.status(200).json({ data: leaveList, count:count });
          })
      }).catch(function (err) {
        return next(err);
      })

    });
};


exports.add = function () {
  return compose()
    .use([
      check('type').notEmpty(),
      check('start').isISO8601().withMessage('开始时间不正确'),
      check('end').isISO8601().withMessage('结束时间不正确')
    ])
    .use(checkErrors)
    .use(function (req, res, next) {

      var leave = new Leave(req.body);

      leave.userId = req.user._id

      return leave.saveAsync().then(leave => {
        req.leave = leave
        next()
      }).catch(function (err) {
        return next(err);
      });
    })
    .use(sendMail)
}

exports.destroy = function () {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return Leave.findByIdAsync(value).then(function (leave) {
            if (!leave) {
              throw new Error('ID错误')
            } else {
              if (leave.userId != req.user.id) {
                throw new Error('不能删除别人的内容')
              }
            }
          })
        })
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Leave.findByIdAndRemoveAsync(req.query.id).then(function(leave) {
        return res.status(200).json({ result: 0 });
      }).catch(function (err) {
        return next(err);
      });
    })
};

exports.update = function (req,res) {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return Leave.findByIdAsync(value).then(function (leave) {
            if (!leave) {
              throw new Error('ID错误')
            } else {
              if (leave.userId != req.user.id) {
                throw new Error('不能修改别人的内容')
              }
            }
          })
        }),
      check('type').notEmpty().withMessage('类型不能为空'),
      check('start').isISO8601().withMessage('开始时间不正确'),
      check('end').isISO8601().withMessage('结束时间不正确')
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Leave.findByIdAsync(req.body.id).then(function (leave) {
        leave.type = req.body.type
        leave.start = req.body.start
        leave.end = req.body.end

        leave.saveAsync().then(leave => {
          req.leave = leave
          next()
        }).catch(err => {
          next(err)
        })
      }).catch(err => {
        next(err)
      })
    })
    .use(sendMail)
}

const sendMail = function (req, res, next) {

  let leave = req.leave

  if (req.body.send !== 'send') {
    return res.status(200).json({ result: 0, leave_id: leave.id });
  }

  let leaveType = leave.type
  let start = moment(leave.start)
  let end = moment(leave.end)

  let time = start.format('YYYY-MM-DD HH:mm:ss') + ' 到 ' + end.format('YYYY-MM-DD HH:mm:ss')

  let datetime = start.format('YYYY-MM-DD ')
  let range = moment.range(leave.start, leave.end)
  let hours = 0
  req.user.leave.worktimes.forEach(worktime => {
    let worktimeRange = moment.range(datetime + worktime.value[0] + ':00', datetime + worktime.
        value[1] + ':00')

      if (range.intersect(worktimeRange)) {
        hours += range.intersect(worktimeRange).diff() / 3600 / 1000
      }
  })
  let days = Math.ceil(hours / 8)
  hours = hours - days * 8

  const server = email.server.connect({
    user: config.mail.username,
    password: config.mail.password,
    host: 'smtp.qq.com',
    ssl: true
  });

  let leaveText = req.user.leave.types.find(item => {
    return item.key === leaveType
  })

  let template = req.user.leave.mail.template.replace('{{leaveTitle}}', leaveText !== undefined ? leaveText.title : leaveType)
  template = template.replace('{{leaveTime}}', time)
  template = template.replace('{{leaveHours}}', hours)
  template = template.replace('{{leaveDays}}', days)
  template += '</br></br><img src="cid:my-signature">'

  server.send({
    from: config.mail.username,
    to: req.user.leave.mail.to,
    cc: req.user.leave.mail.cc,
    subject: '请假',
    text: '',
    attachment: [
      {
        data: template,
        alternative: true
      },
      {
        path: "src/assets/signature.png",
        type: "image/png",
        inline: true,
        headers: {
          "Content-ID": "<my-signature>"
        }
      }
    ]
  }, function (err, message) {
    if (err) {
      return res.status(200).json({ result: -1, leave_id: leave.id });
      next(err)
    } else {
      leave.status = 1
      return leave.saveAsync().then(() => {
        return res.status(200).json({ result: 0, leave_id: leave.id });
      })
    }
  })
}

exports.getSettings = function () {
  return compose()
    .use([
    ])
    .use(checkErrors)
    .use(function (req, res, next) {

      return User.findByIdAsync(req.user._id).then(function (user) {
        let p = path.resolve('./src/assets/' + user._id + '/signature.png')
        let settings = Object.assign({}, user.leave)
        let mail = {
          ...settings.mail
        }
        let signature = fs.existsSync(p) ? fs.readFileSync(p) : false
        mail.signature = signature ? 'data:image/png;base64,' + (new Buffer(signature).toString('base64')) : false
        settings.mail = mail
        return res.status(200).json({ result: 0, data: settings })
      }).catch(function (err) {
        return next(err);
      })

    });
};

exports.saveSettings = function () {
  return compose()
    .use([
    ])
    .use(checkErrors)
    .use(function (req, res, next) {

      return User.findByIdAsync(req.user._id).then(function (user) {
        user.leave.types = req.body.types
        user.leave.mail = req.body.mail
        user.leave.worktimes = req.body.worktimes

        return user.saveAsync().then(function () {
          return res.status(200).json({ result: 0 })
        })
      }).catch(function (err) {
        return next(err);
      })

    });
};

exports.upload = function () {
  return compose()
    .use([
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      let p = path.resolve('./src/assets/' + req.user._id)
      if (fs.existsSync(p)) {
        req.uploadPath = p
        return next()
      }
      return fs.mkdir(p, { recursive: true }, err => {
        if (err) {
          return next(err)
        }

        req.uploadPath = p
        next()
      })
    })
    .use(function (req, res, next) {
      return req.files.file.mv(req.uploadPath + '/signature.png', err => {
        if (err) {
          return next(err)
        }
        return res.status(200).json({ result: 0 })
      })
    });
}
