/** 
 * 消息队列表
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  title: String,
  content: String,
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
MessageSchema.methods = {
}

MessageSchema.set('toObject', { virtuals: true });

var Message = mongoose.model('Message', MessageSchema);
var Promise = require('bluebird');
Promise.promisifyAll(Message);
Promise.promisifyAll(Message.prototype);

module.exports = Message;
