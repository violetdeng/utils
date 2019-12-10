/** 
 * 用户表
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeaveSchema = new Schema({
  type: String,
  start: Date,
  end: Date,
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
LeaveSchema.methods = {
}

LeaveSchema.set('toObject', { virtuals: true });

var Leave = mongoose.model('Leave', LeaveSchema);
var Promise = require('bluebird');
Promise.promisifyAll(Leave);
Promise.promisifyAll(Leave.prototype);

module.exports = Leave;
