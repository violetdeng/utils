const commandLineArgs = require('command-line-args');
const path = require('path');
const readline = require('linebyline');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function doFileReplace(target, file, from, to) {
  return new Promise(function(resolve, reject) {
    let rl = readline(file);
    rl.on('line', function(line, lineCount, byteCount) {
      line = line.replace(from, to);
      line += "\r\n";
      fs.writeFile(target, line, { flag: 'a+', encoding: 'utf-8' }, function (err) {
        if (err) {
          reject(err)
        }
      });
    })
    .on('error', function(e) {
      reject(e);
    })
    .on('end', function() {
      resolve();
    });
  });
}

function truncateFile(file) {
  return new Promise(function(resolve, reject) {
    fs.unlink(file, function(err) {
      if (err) {
        if (err.errno === -2) {
          resolve()
        } else {
          reject(err)
        }
      } else {
        resolve()
      }
    });
  })
}

async function doReplace(file, from, to) {
  try {
    let target = '/tmp/' + path.basename(file);
    await truncateFile(target);
    await doFileReplace(target, file, from, to);
    return true;
  } catch(e) {
    console.error(e);
    return false;
  }
}

exports.run = function(argv) {
  const commandDefinitions = [
    { name: 'from', type: String },
    { name: 'to', type: String },
    { name: 'file', type: String },
    { name: 'reg', type: String, default: '' }
  ];

  const options = commandLineArgs(commandDefinitions, { argv });

  const from = new RegExp(options.from, options.reg);
  const to = options.to;
  const file = options.file;

  doReplace(file, from, to).then(function(result) {
    if (result === false) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}
