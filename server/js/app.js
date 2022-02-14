const favicon = require("koa-favicon");
const Koa = require("koa");
const routers = require("../routes");
const serve = require("koa-static");
const path = require("path");
const http = require("http");
const utils = require("./utils.js");
// const cors = require("koa-cors");

const dodexRouter = routers.dodexRouter;
const app = new Koa();

// app.use(cors());

app.use(routers.routers());

app.use(async (ctx, next) => {
	await next();
	const rt = ctx.response.get("X-Response-Time");
	utils.log("info", `${ctx.method} ${ctx.url} - ${rt}`, __filename, accessLogger);
});

app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	ctx.set("X-Response-Time", `${ms}ms`);
});

app.use(serve(path.join(__dirname, "../")));
app.use(serve(path.join(__dirname, "../../")));
app.use(favicon(path.join(__dirname, "favicon.ico")));

const server = http.createServer(app.callback());
dodexRouter.socketserver(server);

module.exports =  { app, server }
// module.exports = server;
// module.exports = app; // server;
