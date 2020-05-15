/** 
 * 文字处理表
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WordSchema = new Schema({
  from: String,
  to: String,
  file: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

/**
 * Virtuals
 */

/**
 * methods
 */
WordSchema.methods = {
}

WordSchema.set('toObject', { virtuals: true });

var Word = mongoose.model('Word', WordSchema);
var Promise = require('bluebird');
Promise.promisifyAll(Word);
Promise.promisifyAll(Word.prototype);

module.exports = Word;
