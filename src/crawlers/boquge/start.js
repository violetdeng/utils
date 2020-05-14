'use strict';

const methods = require('./methods');
const { saveBook, ERRORS, mergeBook } = require('../functions');

function run(urls, book, cb) {
  methods.fetchContents(book, urls, function (errors) {
    if (errors) {
      book.crawlers.errors = errors;
      book.status = 3;
      saveBook(book, function () {
        cb(ERRORS.FETCH_ERROR);
      }, cb);
    } else {
      book.status = 2;
      saveBook(book, function () {
        mergeBook(book, function () {
          cb(ERRORS.SUCC);
        }, cb);
      }, cb);
    }
  });
}

exports.start = function(book, cb) {
  if (book.crawlers.attributes.chapter) {
    book.status = 1;
    saveBook(book, function () {
      methods.fetchUrls(book.crawlers.attributes.chapter, function (urls) {
        if (urls.length) {
          run(urls, book, cb);
        } else {
          book.crawlers.errors = [
            '读取章节目录错误'
          ];
          book.status = 3;
          saveBook(book, function () {
            cb(ERRORS.FETCH_ERROR);
          }, cb);
        }
      })
    }, cb);
  } else {
    book.crawlers.errors = [
      '配置错误'
    ];
    book.status = 3;
    saveBook(book, function () {
      cb(ERRORS.FETCH_ERROR);
    }, cb);
  }
}

exports.error = function(book, cb) {
  if (book.crawlers.errors) {
    book.status = 1;
    saveBook(book, function () {
      run(book.crawlers.errors, book, cb);
    }, cb);
  } else {
    book.crawlers.errors = [
      '配置错误'
    ];
    book.status = 3;
    saveBook(book, function () {
      cb(ERRORS.FETCH_ERROR);
    }, cb);
  }
}
