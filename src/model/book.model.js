/** 
 * 书籍表
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = new Schema({
  author: String,
  title: String,
  type: {
    type: Number,
    default: 1
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: Number,
    default: 0
  },
  crawlers: {
    website: String,
    downloadPid: {
      type: String
    },
    attributes: {
      type: Object,
      default: {}
    },
    errors: {
      type: Array,
      default: []
    }
  },
  file: String,
}, {
  timestamps: true
});

/**
 * Virtuals
 */
BookSchema
  .virtual('downloadConfigure')
  .get(function() {
    return {
      'type': this.download,
    };
  });

/**
 * methods
 */
BookSchema.methods = {
}

BookSchema.set('toObject', { virtuals: true });

var Book = mongoose.model('Book', BookSchema);
var Promise = require('bluebird');
Promise.promisifyAll(Book);
Promise.promisifyAll(Book.prototype);

module.exports = Book;
