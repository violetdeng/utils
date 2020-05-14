'use strict';

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
//const logger = require('@/logger');
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
  const cmd = "cd " + getBookPath(book) + "; ls | grep '.*\.txt$' | sort -n | xargs cat > m; mv m " + book.file + "; rm -rf " + getBookPath(book);
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

function cnyMapUnit(list, units) {
  const ul = units.length;
  let xs = [];
  list.reverse().map((x, index) => {
    let l = xs.length;
    let n = 0;
    //console.log(x, l);
    if (x != 0 || !(l%4)) {
      if (l) {
        n = (x == 0 ? '' : x) + (units[(l-1)%ul]);
      } else {
        n = x == 0 ? '' : x;
      }
    } else {
      //n = xs[0][0] ? x : '';
      n = xs[index-1] != 0 ? x : '';
      //console.log('xs', xs[index-1]);
    }
    xs.push(n);
  })
  return xs.reverse();
}

exports.indexToChinese = function(index) {
  const cnynums = ['零', '一', '二' , '三', '四', '五', '六', '七', '八', '九'];
  const cnygrees = ['十', '百', '千', '万', '拾', '佰', '仟', '亿'];
  let ret = cnyMapUnit(index.toString().split(''), cnygrees).join('');

  for (let i = 0; i < cnynums.length; i ++) {
    ret = ret.replace(new RegExp(i,"gm"), cnynums[i]);
  }
  return '第' + ret + '章'
}
