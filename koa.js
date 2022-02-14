const Koa = require("koa");
const serve = require("koa-static");
const path = require("path");
const { accessLogger, logger } = require("./server/js/logger");
const utils = require("./server/js/utils.js");
const { app, server } = require("./server/js/app");

global.accessLogger = accessLogger;
global.logger = logger;

app.use(serve(path.join(__dirname, "./allure-report")));
app.use(serve(path.join(__dirname, "public")));

const port = process.env.PORT || 3080;

server.listen(port, function listening() {
    utils.log("info", `Listening on ${server.address().port}`, __filename);
});
