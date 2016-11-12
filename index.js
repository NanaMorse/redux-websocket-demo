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

wss.on('connection', function (ws) {

  ws.send(JSON.stringify({
    type: 'getData',
    data: getStoreData()
  }));

  ws.on('message', function (msg) {

    const parsedMsg = JSON.parse(msg);

    switch (parsedMsg.type) {
      case 'syncData': {
        return syncData(parsedMsg.data);
      }
    }
  });
});
