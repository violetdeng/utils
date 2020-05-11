'use strict';

const mongoose = require('mongoose');
const Message = mongoose.model('Message');
const logger = require('@/logger');

module.exports = function(app) {
  app.on('books', msg => {
    Message.find({ userId: app.user._id, title: '下载通知' })
      .exec().then(function (items) {
        app.emit('update_books', items)
      })
  });
}
