const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const players = {};

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).substr(2, 9);
  players[id] = { id, x: 0, y: 1, z: 0, name: 'Player' };
  
  ws.send(JSON.stringify({ type: 'init', id, players }));
  
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'move') {
      players[id] = { ...players[id], ...data };
      broadcast({ type: 'update', players });
    }
    if (data.type === 'name') {
      players[id].name = data.name;
      broadcast({ type: 'update', players });
    }
  });
  
  ws.on('close', () => {
    delete players[id];
    broadcast({ type: 'update', players });
  });
  
  function broadcast(data) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
});

server.listen(3000, () => console.log('Server running!'));
