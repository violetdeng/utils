var _ = require('lodash');

var all = [
  {
    type: 'boquge',
    title: '笔趣阁',
    website: 'https://www.boquge.com/'
  }
];


var config = [];
all.forEach(function (item) {
  config.push(_.merge(item, require('./' + item.type + '/config.js')))
})
module.exports = config;
