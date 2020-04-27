'use strict';

const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const email = require('emailjs');
const Book = mongoose.model('Book');
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

exports.all = function () {
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

      var query = Book.find({ userId: userId });

      query.countAsync().then(function (count) {
        return Book.find({ userId: userId })
          //.skip(startRow)
          //.limit(itemsPerPage)
          //.sort(sortName)
          .exec().then(function (items) {
            return res.status(200).json({ data: items, count:count });
          })
      }).catch(function (err) {
        return next(err);
      })

    });
};


exports.add = function () {
  return compose()
    .use([
      check('author').notEmpty(),
      check('title').notEmpty(),
      check('type').toInt().isIn([1, 2]),
      check('file').custom(async (value, { req }) => {
          if (req.body.type !== 1) {
            return true
          }
          if (!value) {
            return false
          }
          let p = path.resolve('./src/assets/' + req.user._id + '/books/' + value)
          let exists = await fs.stat(p, function (err, stats) {
            if (err) {
              return false
            }
            if (!stats.isFile()) {
              return false
            }
            return true
          })
          return exists
        })
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      let p = path.resolve('./src/store/' + req.user._id + '/books/' + req.body.author)
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

      var book = new Book(req.body);

      book.userId = req.user._id
      if (book.type === 1) {
        book.status = 2
        book.file = req.uploadPath + '/' + book.author + '-' + book.title + '.txt'
      }

      return book.saveAsync().then(book => {
        req.book = book
        if (book.type === 1) {
          fs.rename(path.resolve('./src/assets/' + req.user._id + '/books/' + req.body.file), book.file, err => {
            if (err) {
              next(err)
            } else {
              return res.status(200).json({ result: 0, id: book.id });
            }
          })
        } else {
          next()
        }
      }).catch(function (err) {
        return next(err);
      });
    })
  // TODO 开始下载
    //.use(sendMail)
}

exports.destroy = function () {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return Book.findByIdAsync(value).then(function (book) {
            if (!book) {
              throw new Error('ID错误')
            } else {
              if (book.userId != req.user.id) {
                throw new Error('不能删除别人的内容')
              }
            }
          })
        })
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Book.findByIdAndRemoveAsync(req.query.id).then(function(leave) {
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
        }),
      check('type').notEmpty().withMessage('类型不能为空'),
      check('start').isISO8601().withMessage('开始时间不正确'),
      check('end').isISO8601().withMessage('结束时间不正确')
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Book.findByIdAsync(req.body.id).then(function (leave) {
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
      let p = path.resolve('./src/assets/' + req.user._id + '/books')
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
      let randomFile = crypto.randomBytes(16).toString('hex') + '.txt';
      return req.files.file.mv(req.uploadPath + '/' + randomFile, err => {
        if (err) {
          return next(err)
        }
        return res.status(200).json({ result: 0, data: randomFile })
      })
    });
}
