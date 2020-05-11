const Crawler = require("crawler");
const fs = require('fs');
const logger = require('@/logger');
const { getBookPath } = require('../functions');
 
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
      }else{
        var $ = res.$;
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
        var urls = [];
        $('#chapters-list a').each(function() {
          urls.push({
            title: $(this).text(),
            url: $(this).attr('href')
          })
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
    maxConnections : 10,
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
      if(error){
        logger.error(error);
      }else{
        var $ = res.$;
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
        fs.writeFileSync(res.options.filename, res.options.chapter + "\r\n\r\n")
        var content = $('#txtContent').html()
        if (content) {
          fs.writeFileSync(res.options.filename, content.replace('<br>', "\r\n"), {
            flag: 'a'
          })
        } else {
          errors.push({
            uri: res.options.uri,
            title: res.options.chapter
          })
        }
      }
      done();
    }
  });


  urls.forEach(function (item, index) {
    // TODO
    if (index > 10) return;
    c.queue({
      uri: 'https://www.boquge.com' + item.url,
      chapter: item.title,
      filename: getBookPath(book) + index + '.txt'
    });
  })

  c.on('drain', function () {
    callback(errors.length ? errors : null)
  })
}
