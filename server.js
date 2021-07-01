const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {formatMessage,formatMessage2} = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ผีเฝ้าห้อง';
let numUsers = 0;
// Run when client connects
io.on('connection', socket => {

  socket.on('joinRoom', ({ username, room ,deparment,fullname,pic,inout,license}) => {
    const user = userJoin(socket.id, username, room,deparment,fullname,pic,inout,license);

    socket.join(user.room);
    ++numUsers;
    // Welcome current user
    socket.emit('message', formatMessage(botName, '  Welcome to Chat room!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.fullname}  has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', ({msg,time}) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage2(user.fullname, msg,time));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {

     --numUsers

      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.fullname} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
