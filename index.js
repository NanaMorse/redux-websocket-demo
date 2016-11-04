const koa = require('koa');
const staticServe = require('koa-static');
const app = koa();

app.use(staticServe('./public'));

app.listen(3000);