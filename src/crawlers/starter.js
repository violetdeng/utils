const mongoose = require('mongoose');
const logger = require('@/logger');
const Book = mongoose.model('Book');

const boquge = require('./boquge/start');

exports.run = function () {
  if (process.argv[2]) {
    const id = process.argv[2];
    Book.findByIdAsync(id).then(function (book) {
      switch (book.crawlers.website) {
        case 'boquge':
          boquge.start(book, function (result) {
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
}
