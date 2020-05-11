'use strict';

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const logger = require('@/logger');
const tempPath = 'store/books/';

const ERRORS = {
  SUCC: 0,
  DB_ERROR: 1,
  MERGE_ERROR: 2,
  FETCH_ERROR: 3
};
exports.ERRORS = ERRORS;

function getBookPath(book) {
  let p = path.resolve(tempPath + book._id);

  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
  return p + '/';
}
exports.getBookPath = getBookPath;

exports.saveBook = function (book, success, error) {
  book.saveAsync().then(success).catch(function (e) {
    logger.error(e.message);
    error(ERRORS.DB_ERROR);
  })
}

exports.mergeBook = function (book, success, error) {
  const cmd = "cd " + getBookPath(book) + "; ls | grep '.*\.txt$' | sort -n | xargs cat > m";
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return error(ERRORS.MERGE_ERROR);
    }
    if (stderr) {
      return error(ERRORS.MERGE_ERROR);
    }
    success();
  });
}
