const koa = require('koa');
const koaStatic = require('koa-static');
const app = koa();
const WebSocketServer = require('ws').Server;

const fs = require('fs');

app.use(koaStatic('./public'));

const wss = new WebSocketServer({server: app.listen(3000)});

function getStoreData() {
  return fs.readFileSync('./dataStore.json', 'utf-8');
}

function syncData(storeData) {
  fs.writeFile('./dataStore.json', storeData, function (err) {
    if (err) throw err;
    console.log('write ok!');
  });
}

// todo: only broadcast dispatch info
function broadcastStoreData(ws, storeData) {
  wss.clients.forEach((client) => {
    if (client !== ws) client.send(JSON.stringify({
      type: 'updateData',
      data: storeData
    }));
  });
}

wss.on('connection', function (ws) {

  ws.send(JSON.stringify({
    type: 'getData',
    data: getStoreData()
  }));

  ws.on('message', function (msg) {

    const parsedMsg = JSON.parse(msg);

    switch (parsedMsg.type) {
      case 'syncData': {
        syncData(parsedMsg.data);
        broadcastStoreData(ws, parsedMsg.data);
        return;
      }
    }
  });
});
