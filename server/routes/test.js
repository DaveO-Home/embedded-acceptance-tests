const fs = require("fs");
const Router = require("koa-router");
const router = new Router({ prefix: "/test" });

router.get("/", async (ctx, next) => {
  if (ctx.path === "/favicon.ico") {
    return;
  }
  const src = fs.createReadStream("server/test/index.html");
  ctx.response.set("content-type", "text/html");
  ctx.body = src;
  ctx.status = 200;
});

module.exports = router;
