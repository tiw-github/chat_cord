
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const moment = require('moment');
const formatMessage = require('./utils/messages');
const admin = require("firebase-admin");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const serviceAccount = require("./utils/bamschat.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bams-chat-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();
const ref = db.ref("/chats");
// Fetch the service account key JSON file contents

// Initialize the app with a service account, granting admin privileges


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ผีเฝ้าห้อง';
let numUsers = 0;
const roo = 'dtc03||76';
// Run when client connects
io.on('connection', socket => {

  socket.on('joinRoom', ({ username, room ,deparment,fullname,pic,license}) => {
    const user = userJoin(socket.id, username, room,deparment,fullname,pic,license);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to Chat room!',botName));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName,botName, `${user.username} has joined the chat`,botName)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', ({msg,pic}) => {
    const user = getCurrentUser(socket.id);

    /*const usersRef = ref.child(user.room).child(user.username);
    usersRef.push({username: user.username,
                       text: msg,
                       time: moment().format('YYYY-MM-DD HH:mm:ss'),
                       pic: pic});*/

    io.to(user.room).emit('message', {
    username: user.username,
    text: msg,
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    pic: pic
    });

    io.to(user.room).emit('message2', {
        username: user.username,
        text: msg,
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        pic: pic
        });


  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`,botName)
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
