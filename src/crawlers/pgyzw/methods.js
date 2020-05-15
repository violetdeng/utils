const Crawler = require("crawler");
const fs = require('fs');
const logger = require('@/logger');
const { getBookPath, indexToChinese } = require('../functions');
 
exports.fetchUrls = function(url, callback) {
  var c = new Crawler({
    maxConnections : 10,
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
    },
    // This will be called for each crawled page
    callback : function (error, res, done) {
      if (error) {
        logger.error(error);
      } else {
        var $ = res.$;
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
        var urls = [];
        var index = 0;
        $('.acss a').each(function() {
          urls.push({
            title: $(this).text(),
            uri: (new URL($(this).attr('href'), url)).href,
            index
          });
          index ++;
        })
        callback(urls)
      }
      done();
    }
  });

  c.queue(url)
}

exports.fetchContents = function(book, urls, callback) {
  var errors = [];
  var c = new Crawler({
    maxConnections : 1,
    jQuery: {
      name: 'cheerio',
      options: {
        decodeEntities: false
      }
    },
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
    },
    // This will be called for each crawled page
    callback : function (error, res, done) {
      if (error) {
        logger.error(error);
      } else {
        var $ = res.$;
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
        fs.writeFileSync(res.options.filename, res.options.chapter + "\r\n\r\n")
        var content = $(res.body).find('#content').html()
        if (content) {
          fs.writeFileSync(res.options.filename, content.replace(/<br>/g, "\r\n"), {
            flag: 'a'
          })
        } else {
          errors.push({
            uri: res.options.uri,
            title: res.options.chapter,
            index: res.options.index
          })
        }
      }
      done();
    }
  });


  urls.forEach(function (item, index) {
    c.queue({
      uri: item.uri,
      chapter: indexToChinese(item.index + 1) + ' ' + item.title,
      index: item.index,
      filename: getBookPath(book) + item.index + '.txt'
    });
  })

  c.on('drain', function () {
    callback(errors.length ? errors : null)
  })
}
