const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*"
  }
});

let waiting = null;

io.on('connection', socket => {
  if (waiting) {
    socket.partner = waiting;
    waiting.partner = socket;

    socket.emit('joined');
    waiting.emit('joined');

    waiting = null;
  } else {
    waiting = socket;
  }

  socket.on('signal', data => {
    if (socket.partner) {
      socket.partner.emit('signal', data);
    }
  });

  socket.on('disconnect', () => {
    if (socket.partner) {
      socket.partner.emit('leave');
      socket.partner.partner = null;
    }

    if (waiting === socket) {
      waiting = null;
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
