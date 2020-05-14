const mongoose = require('mongoose');
const logger = require('@/logger');
const Book = mongoose.model('Book');

const crawlers = require('./index');

exports.run = function (id) {
  if (!id) {
    process.exit();
  }
  Book.findByIdAsync(id).then(function (book) {
    let crawler = crawlers.find(item => {
      return item.type === book.crawlers.website
    })
    if (crawler) {
      require(crawler.type + '/start').start(book, function (result) {
        process.exit(result);
      });
    } else {
      logger.info('not found website');
      process.exit();
    }
  }).catch(function () {
    logger.info('not found');
    process.exit();
  });
}

exports.runErrors = function (id) {
  if (!id) {
    process.exit();
  }
  Book.findByIdAsync(id).then(function (book) {
    switch (book.crawlers.website) {
      case 'boquge':
        boquge.error(book, function (result) {
          process.exit(result);
        });
        break;
      default:
        logger.info('not found website');
        process.exit();
    }
  }).catch(function () {
    logger.info('not found');
    process.exit();
  });
}
