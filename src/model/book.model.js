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
  file: String
}, {
  timestamps: true
});

/**
 * Virtuals
 */

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
