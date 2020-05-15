'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const querystring = require('querystring');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const logger = require('@/logger');
const Word = mongoose.model('Word');
const User = mongoose.model('User');
const Message = mongoose.model('Message');
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
      var currentPage = (parseInt(req.query.page) > 0)?parseInt(req.query.page):1;
      var itemsPerPage = (parseInt(req.query.itemsPerPage) > 0)?parseInt(req.query.itemsPerPage):10;
      var startRow = (currentPage - 1) * itemsPerPage;

      var sortName = String(req.query.sortName) || "created";
      var sortOrder = req.query.sortOrder;
      if(sortOrder === 'false'){
        sortName = "-" + sortName;
      }

      var userId = req.user._id;

      var query = Word.find({ userId: userId });

      query.countDocuments((err, count) => {
        if (err) {
          return next(err);
        }
        return Word.find({ userId: userId })
          .skip(startRow)
          .limit(itemsPerPage)
          .sort(sortName)
          .exec().then(function (items) {
            return res.status(200).json({ data: items, count: count });
          })
      })
    });
};


exports.add = function () {
  return compose()
    .use([
      check('from').notEmpty().withMessage('目标文字不能为空'),
      //check('to').notEmpty().withMessage('替换文字不能为空'),
      check('file').custom(async (value, { req }) => {
          if (!value) {
            return false
          }
          let exists = await fs.stat(value, function (err, stats) {
            if (err) {
              return false
            }
            if (!stats.isFile()) {
              return false
            }
            return true
          })
          return exists
        }).withMessage('文件路径不能为空')
    ])
    .use(checkErrors)
    .use(function (req, res, next) {

      var word = new Word(req.body);

      word.userId = req.user._id
      word.status = 0

      return word.saveAsync().then(word => {
        req.word = word
        next()
      }).catch(function (err) {
        return next(err);
      });
    })
    .use(startToExecute)
}

exports.destroy = function () {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return Word.findByIdAsync(value).then(function (word) {
            if (!word) {
              throw new Error('ID错误')
            } else {
              if (word.userId != req.user.id) {
                throw new Error('不能删除别人的内容')
              }
            }
          })
        })
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Word.findByIdAndRemoveAsync(req.query.id).then(function(word) {
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
          return Word.findByIdAsync(value).then(function (word) {
            if (!word) {
              throw new Error('ID不存在')
            } else {
              if (word.userId != req.user.id) {
                throw new Error('不能修改别人的内容')
              }
            }
          })
        }),
      check('from').notEmpty().withMessage('目标文字不能为空'),
      //check('to').notEmpty().withMessage('替换文字不能为空'),
      check('file').custom(async (value, { req }) => {
          if (!value) {
            return false
          }
          let exists = await fs.stat(value, function (err, stats) {
            if (err) {
              return false
            }
            if (!stats.isFile()) {
              return false
            }
            return true
          })
          return exists
        }).withMessage('文件路径不能为空')
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Word.findByIdAsync(req.body.id).then(function (word) {
        word.from = req.body.from
        word.to = req.body.to || ''
        word.file = req.body.file

        word.saveAsync().then(word => {
          return res.status(200).json({ result: 0, data: word });
        }).catch(err => {
          next(err)
        })
      }).catch(err => {
        next(err)
      })
    })
}

function startToExecute(req, res, next) {
  let word = req.word;
  let cmd = "cd " + path.resolve('./src')
  cmd += ";node console.js --command=replace --from '" + word.from
  cmd += "' --to '" + word.to + "' --file '" + word.file + "' --reg g"

  const postData = JSON.stringify({
    'cmd': cmd,
    'cb': 'http://violetdeng.com:3000/words/api/change?id=' + word._id
  });

  logger.debug(postData);

  const request = http.request({
    host: '127.0.0.1',
    port: 10000,
    method: 'POST',
    path: '/api/v1/command',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, response => {
    let result = '';
    response.setEncoding('utf8');
    response.on('data', chunk => {
      result += chunk;
    });
    response.on('end', () => {
      result = JSON.parse(result);
      logger.debug(result);
      if (result.error === undefined) {
        return res.status(200).json({ result: -1 });
      } else if (result.error === 0) {
        return res.status(200).json({ result: 0, data: word });
      } else {
        return res.status(200).json({ result: -1 });
      }
    });
  });
  request.on('error', (e) => {
    logger.error(`problem with request: ${e.message}`);
    next(e);
  });
  request.write(postData);
  request.end();
}

exports.doExecute = function() {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return true
        })
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Word.findByIdAsync(req.query.id).then(function (word) {
        if (!word) {
          return res.status(200).json({ result: -1 })
        }
        word.status = 0

        word.saveAsync().then(word => {
          req.word = word
          next()
        }).catch(err => {
          next(err)
        })
      }).catch(err => {
        next(err)
      })
    })
    .use(startToExecute)
};

exports.updateStatus = function() {
  return compose()
    .use(function (req, res, next) {
      Word.findByIdAsync(req.query.id).then(function (word) {
        if (!word) {
          logger.debug("id not found: " + req.query.id);
          return res.status(200).json({ result: -1 })
        }

        if (req.query.status == 1) {
          word.status = 1
        } else if (req.query.status == 2) {
          word.status = 2
        }

        return word.saveAsync().then(word => {
          logger.debug("update success: " + req.query.id);
          let message = new Message({
            title: '文字通知',
            content: JSON.stringify(word),
            userId: word.userId
          });
          return message.saveAsync().then(message => {
            return res.status(200).json({ result: 0, data: word });
          }).catch(function (err) {
            logger.debug("update failed: " + req.query.id);
            return res.status(200).json({ result: -2 })
          });
        }).catch(function (err) {
          logger.debug("update failed: " + req.query.id);
          return res.status(200).json({ result: -2 })
        });
      })
    })
}

exports.show = function() {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return true
        })
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Word.findByIdAsync(req.query.id).then(function (word) {
        if (!word || word.status !== 2) {
          return res.status(200).json({ result: -1 })
        }

        let filePath = '/tmp/' + path.basename(word.file)
        // 设置响应头
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=UTF-8'
        });
        res.write('<body style="margin:0;font-size:1.2rem;"><pre style="white-space: pre-wrap!important; word-wrap: break-word!important;">');

        // 得到文件输入流
        var readStream = fs.createReadStream(filePath);
        readStream.on('data', (chunk) => {
          // 文档内容以二进制的格式写到response的输出流
          res.write(chunk, 'binary');
        });
        readStream.on('end', () => {
          res.write('</pre></body>');
          res.end();
        });
      }).catch(err => {
        next(err)
      })
    })
    .use(startToExecute)
};

exports.replace = function() {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return true
        })
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Word.findByIdAsync(req.query.id).then(function (word) {
        if (!word || word.status !== 2) {
          return res.status(200).json({ result: -1 })
        }

        word.status = 3;

        return word.saveAsync().then(word => {
          let filePath = '/tmp/' + path.basename(word.file)
          fs.rename(filePath, word.file, function(err) {
            if (err) {
              next(err)
            } else {
              return res.status(200).json({ result: 0, data: word })
            }
          })
        }).catch(function (err) {
          return next(err);
        });
      }).catch(err => {
        next(err)
      })
    })
};
