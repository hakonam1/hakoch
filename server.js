// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require('axios');
const { DateTime } = require('luxon');
const path = require('path');

let chatLog = [];
let userCount = 0;
let webhookURL = process.env.WEBHOOK_URL || '';

app.use(express.static(path.join(__dirname, 'public')));

function handleNewUser(socket) {
  userCount++;
  io.emit('userCount', userCount);
  socket.emit('chatLog', chatLog);
}

function handleUserDisconnect() {
  userCount--;
  io.emit('userCount', userCount);
}

function handleNewMessage(message) {
  const timestamp = DateTime.now().setZone('Asia/Tokyo').toFormat('yyMMddHHmmss');
  const chatMessage = {
    text: message,
    timestamp: timestamp
  };
  chatLog.push(chatMessage);
  if (chatLog.length > 50) {
    chatLog.shift();
  }
  io.emit('chatLog', chatLog);
  if (webhookURL) {
    sendToDiscord(message);
  }
}

function handleSetWebhook(url) {
  webhookURL = url;
}

io.on('connection', (socket) => {
  handleNewUser(socket);
  socket.on('message', handleNewMessage);
  socket.on('setWebhook', handleSetWebhook);
  socket.on('disconnect', handleUserDisconnect);
});

http.listen(3000, () => {
  console.log('Server is running on port 3000');
});

async function sendToDiscord(message) {
  try {
    const response = await axios.post(webhookURL, {
      content: message
    });
    if (response.status >= 200 && response.status < 300) {
      console.log('Message sent to Discord');
    } else {
      console.error('Error sending message to Discord:', response.status);
    }
  } catch (error) {
    console.error('Error sending message to Discord:', error.message);
  }
}
