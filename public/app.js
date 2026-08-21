const statusEl = document.getElementById('status');
const outputEl = document.getElementById('output');
const formEl = document.getElementById('command-form');
const inputEl = document.getElementById('command-input');

function getToken() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('token');
  if (fromUrl) {
    localStorage.setItem('connector-token', fromUrl);
    return fromUrl;
  }
  return localStorage.getItem('connector-token') || prompt('Enter pairing token:');
}

function setStatus(connected) {
  statusEl.textContent = connected ? 'connected' : 'disconnected';
  statusEl.className = `status ${connected ? 'connected' : 'disconnected'}`;
}

function appendOutput(text) {
  outputEl.textContent += text;
  outputEl.scrollTop = outputEl.scrollHeight;
}

function connect() {
  const token = getToken();
  if (!token) return;

  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${protocol}://${location.host}/ws?token=${encodeURIComponent(token)}`);

  ws.addEventListener('open', () => setStatus(true));
  ws.addEventListener('close', () => {
    setStatus(false);
    setTimeout(connect, 2000);
  });
  ws.addEventListener('error', () => ws.close());

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'output') appendOutput(msg.data);
    if (msg.type === 'exit') appendOutput(`\n[session ended, code ${msg.code}]\n`);
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const command = inputEl.value.trim();
    if (!command || ws.readyState !== WebSocket.OPEN) return;
    appendOutput(`> ${command}\n`);
    ws.send(JSON.stringify({ type: 'command', data: command }));
    inputEl.value = '';
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

connect();
