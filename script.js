// script.js
const socket = io();
const chatLogContainer = document.getElementById('chatLog');

function createMessageElement(message) {
  const messageElement = document.createElement('div');
  const timestamp = luxon.DateTime.fromFormat(message.timestamp, 'yyMMddHHmmss', { zone: 'Asia/Tokyo' });
  const formattedTimestamp = `${String(timestamp.hour).padStart(2, '0')}:${String(timestamp.minute).padStart(2, '0')}:${String(timestamp.second).padStart(2, '0')}`;
  messageElement.innerHTML = `
    <div class="message ${message.isOwnMessage ? 'own-message' : ''}">
      <div class="message-content">${message.text}</div>
      <div class="message-timestamp">${formattedTimestamp}</div>
    </div>
  `;
  return messageElement;
}

function displayChatLog(chatLog) {
  chatLogContainer.innerHTML = '';
  chatLog.forEach((message) => {
    chatLogContainer.appendChild(createMessageElement(message));
  });
  chatLogContainer.scrollTop = chatLogContainer.scrollHeight;
}

function sendMessage() {
  const message = messageInput.value.trim();
  if (message !== '') {
    socket.emit('message', message);
    messageInput.value = '';
    chatLogContainer.appendChild(createMessageElement({
      text: message,
      timestamp: luxon.DateTime.local().setZone('Asia/Tokyo').toFormat('yyMMddHHmmss'),
      isOwnMessage: true
    }));
    chatLogContainer.scrollTop = chatLogContainer.scrollHeight;
  }
}

function setWebhook() {
  const webhookURL = webhookInput.value.trim();
  if (webhookURL !== '') {
    socket.emit('setWebhook', webhookURL);
    webhookInput.value = '';
  }
}

// メッセージ送信
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// 接続数の表示
const userCountElement = document.getElementById('userCount');
socket.on('userCount', (userCount) => {
  userCountElement.textContent = `現在の接続数: ${userCount}`;
});

// チャットログを受信したときの処理
socket.on('chatLog', (chatLog) => {
  displayChatLog(chatLog);
});

// Discord Webhookの設定
const webhookForm = document.getElementById('webhookForm');
const webhookInput = document.getElementById('webhookInput');
webhookForm.addEventListener('submit', (e) => {
  e.preventDefault();
  setWebhook();
});
