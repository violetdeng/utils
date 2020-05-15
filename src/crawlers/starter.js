const mongoose = require('mongoose');
const logger = require('@/logger');
const Book = mongoose.model('Book');

const { ERRORS } = require('./functions');
const crawlers = require('./index');

exports.run = function (id) {
  if (!id) {
    process.exit(ERRORS.PARAM_ERROR);
  }
  Book.findByIdAsync(id).then(function (book) {
    let crawler = crawlers.find(item => {
      return item.type === book.crawlers.website
    })
    if (crawler) {
      require('./' + crawler.type + '/start').start(book, function (result) {
        process.exit(result);
      });
    } else {
      logger.info('not found website');
      process.exit(ERRORS.CONFIG_ERROR);
    }
  }).catch(function (e) {
    logger.info('not found: ' + e.message);
    process.exit(ERRORS.NOT_FOUND);
  });
}

exports.runErrors = function (id) {
  if (!id) {
    process.exit(ERRORS.PARAM_ERROR);
  }
  Book.findByIdAsync(id).then(function (book) {
    let crawler = crawlers.find(item => {
      return item.type === book.crawlers.website
    })
    if (crawler) {
      require('./' + crawler.type + '/start').error(book, function (result) {
        process.exit(result);
      });
    } else {
      logger.info('not found website');
      process.exit(ERRORS.CONFIG_ERROR);
    }
  }).catch(function () {
    logger.info('not found: ' + e.message);
    process.exit(ERRORS.NOT_FOUND);
  });
}
