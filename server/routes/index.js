/**
 * Add any additional routes here.
 */
const combineRouters = require("koa-combine-routers");

const dodexRouter = require("./dodex");
const testRouter = require("./test");
const rootRouter = require("./root");
const bootRouter = require("./boot");

const routers = combineRouters(
  dodexRouter.router,
  testRouter,
  rootRouter,
  bootRouter
);

exports.dodexRouter = dodexRouter;
exports.routers = routers;
