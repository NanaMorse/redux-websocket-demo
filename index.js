const koa = require('koa');
const koaStatic = require('koa-static');
const koaRouter = require('koa-router')();
const koaBodyParser = require('koa-body-parser');
const app = koa();
const WebSocketServer = require('ws').Server;

const fs = require('fs');

app.use(koaStatic('./public'));

app.use(koaBodyParser());

koaRouter.get('/getData', function *() {
  this.body = fs.readFileSync('./dataStore.json', 'utf-8')
});

koaRouter.post('/syncData', function *(next) {
  this.body = 'OK!';

  // update remote store data
  fs.writeFile('./dataStore.json', this.request.body, function (err) {
    if (err) throw err;
    console.log('write ok!');
  });

  // todo broadcast store update websocket message to every connection

});

app.use(koaRouter.routes()).use(koaRouter.allowedMethods());

const wss = new WebSocketServer({server: app.listen(3000)});

wss.on('connection', function () {
  console.log('hello websocket!');
});
