const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {formatMessage,formatMessage2} = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getTime
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

    // Welcome current user
    socket.emit('message', formatMessage2(botName, 'Welcome to Chat room!',getTime));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage2(botName, `${user.fullname}  has joined the chat`,getTime)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', {msg,time} => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage2(user.username, msg,getTime));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage2(botName, `${user.username} has left the chat`,getTime)
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
