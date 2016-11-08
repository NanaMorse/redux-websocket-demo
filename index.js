const koa = require('koa');
const koaStatic = require('koa-static');
const koaRouter = require('koa-router')();
const app = koa();

app.use(koaStatic('./public'));

koaRouter.post('/syncData', function *(next) {
  this.body = 'OK!';
});

app.use(koaRouter.routes()).use(koaRouter.allowedMethods());

app.listen(3000);