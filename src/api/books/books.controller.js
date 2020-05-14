'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const querystring = require('querystring');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const email = require('emailjs');
const logger = require('@/logger');
const Book = mongoose.model('Book');
const User = mongoose.model('User');
const Message = mongoose.model('Message');
const compose = require('composable-middleware');
const { check, validationResult } = require('express-validator');
const config = require('../../config/env')
const crawlersConfig = require('../../crawlers');

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

      var query = Book.find({ userId: userId });

      query.countDocuments((err, count) => {
        if (err) {
          return next(err);
        }
        return Book.find({ userId: userId })
          .skip(startRow)
          .limit(itemsPerPage)
          .sort(sortName)
          .exec().then(function (items) {
            return res.status(200).json({ data: items, count: count, config: crawlersConfig });
          })
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
        }).withMessage('必须上传文件'),
      check('website').if((value, { req }) => req.body.type === 2)
        .notEmpty().withMessage('网站不能为空'),
      check('attributes').if((value, { req }) => req.body.type === 2)
        .notEmpty().withMessage('属性不能为空')
        // TODO 检查属性值不能为空
    ])
    .use(checkErrors)
    .use(createBookDir)
    .use(function (req, res, next) {

      var book = new Book(req.body);

      book.userId = req.user._id
      book.file = req.uploadPath + '/' + book.author + '-' + book.title + '.txt'
      if (book.type === 1) {
        book.status = 2
      } else if (book.type === 2) {
        book.crawlers.website = req.body.website
        book.crawlers.attributes = req.body.attributes
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
    .use(startToCrawler)
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
      Book.findByIdAndRemoveAsync(req.query.id).then(function(book) {
        if (book.type === 1) {
          try {
            fs.unlinkSync(book.file)
          } catch(e) {
          }
        }
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
          return Book.findByIdAsync(value).then(function (book) {
            if (!book) {
              throw new Error('ID不存在')
            } else {
              if (book.userId != req.user.id) {
                throw new Error('不能修改别人的内容')
              }
            }
          })
        }),
      check('author').notEmpty(),
      check('title').notEmpty()
    ])
    .use(checkErrors)
    .use(createBookDir)
    .use(function (req, res, next) {
      Book.findByIdAsync(req.body.id).then(function (book) {
        book.author = req.body.author
        book.title = req.body.title

        let newFile = req.uploadPath + '/' + req.body.author + '-' + req.body.title + '.txt'
        if (book.type === 1 || (book.type === 2 && book.status === 2)) {
          if (fs.existsSync(book.file)) {
            fs.renameSync(book.file, newFile)
          }
        }
        book.file = newFile

        book.saveAsync().then(book => {
          return res.status(200).json({ result: 0, data: book });
        }).catch(err => {
          next(err)
        })
      }).catch(err => {
        next(err)
      })
    })
}

function createBookDir(req, res, next) {
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
}

function startToCrawler(req, res, next) {
  let book = req.book;
  let cmd = "cd " + path.resolve('./src')
  if (req.query.onlyerrors == 1) {
    cmd += ";node crawler.js --command=error --id=" + book._id
  } else {
    cmd += ";node crawler.js --id=" + book._id
  }
  const postData = JSON.stringify({
    'cmd': cmd,
    'cb': 'http://violetdeng.com:3000/books/crawler/change?id=' + book._id
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
        book.crawlers.downloadPid = result.id
        book.saveAsync().then(book => {
          return res.status(200).json({ result: 0, data: book });
        }).catch(err => {
          next(err)
        })
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

exports.replace = function () {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return Book.findByIdAsync(value).then(function (book) {
            if (!book) {
              throw new Error('ID不存在')
            } else {
              if (book.userId != req.user.id) {
                throw new Error('不能修改别人的内容')
              }
            }
          })
        }),
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
        }).withMessage('必须上传文件')
    ])
    .use(checkErrors)
    .use(function (req, res, next) {

      Book.findByIdAsync(req.body.id).then(function (book) {

        book.type = 1

        book.saveAsync().then(book => {
          fs.rename(path.resolve('./src/assets/' + req.user._id + '/books/' + req.body.file), book.file, err => {
            if (err) {
              next(err)
            } else {
              return res.status(200).json({ result: 0, data: book });
            }
          })
        })
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

exports.updateCrawlerStatus = function() {
  return compose()
    .use(function (req, res, next) {
      Book.findByIdAsync(req.query.id).then(function (book) {
        if (!book) {
          logger.debug("id not found: " + req.query.id);
          return res.status(200).json({ result: -1 })
        }

        if (req.query.status == 1) {
          book.status = 1
        } else if (req.query.status == 2) {
          book.status = 2
        } else if (req.query.status == 4) {
          book.status = 3
        }

        return book.saveAsync().then(book => {
          logger.debug("update success: " + req.query.id);
          let message = new Message({
            title: '下载通知',
            content: JSON.stringify(book),
            userId: book.userId
          });
          return message.saveAsync().then(message => {
            return res.status(200).json({ result: 0, data: book });
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

exports.crawler = function () {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return true;
        })
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Book.findByIdAsync(req.query.id).then(function(book) {
        if (book.type === 1) {
          return res.status(200).json({ result: 0 });
        }
        req.book = book;
        next();
      }).catch(function (err) {
        return next(err);
      });
    })
    .use(startToCrawler)
};

exports.download = function () {
  return compose()
    .use([
      check('id').trim().notEmpty().withMessage('ID不能为空')
        .custom((value, { req }) => {
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('ID格式错误')
          }
          return true;
        })
    ])
    .use(checkErrors)
    .use(function (req, res, next) {
      Book.findByIdAsync(req.query.id).then(function(book) {
        if (book.type === 2 && book.status != 2) {
          return res.status(200).json({ result: -1 });
        }

        let filename = book.author + '-' + book.title + '.txt'
        // 设置响应头
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',//告诉浏览器这是一个二进制文件
          'Content-Disposition': 'attachment; filename=' + encodeURI(filename),//告诉浏览器这是一个需要下载的文件
        });

        // 得到文件输入流
        var readStream = fs.createReadStream(book.file);
        readStream.on('data', (chunk) => {
          // 文档内容以二进制的格式写到response的输出流
          res.write(chunk, 'binary');
        });
        readStream.on('end', () => {
          res.end();
        });
      }).catch(function (err) {
        return next(err);
      });
    })
};
