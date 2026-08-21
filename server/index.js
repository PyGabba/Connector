const http = require('node:http');
const { WebSocketServer } = require('ws');
const { serveStatic } = require('./static');
const { loadOrCreateToken, isValidToken } = require('./auth');
const { Session } = require('./session');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';
const token = loadOrCreateToken();

const server = http.createServer(serveStatic);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const clientToken = url.searchParams.get('token');

  if (!isValidToken(clientToken, token)) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  const session = new Session(
    (output) => ws.readyState === ws.OPEN && ws.send(JSON.stringify({ type: 'output', data: output })),
    (code) => ws.readyState === ws.OPEN && ws.send(JSON.stringify({ type: 'exit', code }))
  );

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'command') session.run(msg.data);
    } catch {
      // ignore malformed messages
    }
  });

  ws.on('close', () => session.kill());
});

server.listen(PORT, HOST, () => {
  console.log(`Connector server listening on http://${HOST}:${PORT}`);
  console.log(`Pairing token: ${token}`);
});
