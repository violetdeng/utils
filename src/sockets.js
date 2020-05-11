'use strict';

const mongoose = require('mongoose');
const auth = require('./auth/auth-socket.service');
const Message = mongoose.model('Message');

function groupBy(objectArray, property) {
  return objectArray.reduce(function (acc, obj) {
    let key = obj[property]
      if (!acc[key]) {
        acc[key] = []
      }
    acc[key].push(obj)
      return acc
  }, {})
}

let clients = {};

module.exports = function(server) {

  const io = require('socket.io')(server);

  auth.isAuthenticated(io).on('connection', socket => {
    console.debug('a user connected');
    if (!clients[socket.user._id]) {
      clients[socket.user._id] = []
    }
    clients[socket.user._id].push(socket);

    socket.on('disconnect', () => {
      console.debug('user disconnected');
      let index = clients[socket.user._id].findIndex((item) => {
        if (!item) return false;
        return item.id == socket.id
      })
      if (index !== -1) {
        delete clients[socket.user._id][index];
      }
    });

    require('./api/books/socket')(socket);
  });
  // 广播
  // io.emit('test', msg);

  // message 推送
  setInterval(() => {
    Message.find({ status: 0 })
      .exec().then(function (items) {
        if (items.length) {
          let messages = groupBy(items, 'userId');
          for (let userId in messages) {
            if (clients[userId]) {
              clients[userId].forEach(client => {
                client.emit('messages', messages[userId])
              })
              messages[userId].forEach(m => {
                m.status = 1;
                m.saveAsync(() => {
                }).catch(e => {
                  console.error(e)
                })
              })
            }
          }
        }
      })
  }, 1000)
};
