const Router = require("koa-router");
const router = new Router({ prefix: "/root" });

router.get("/", async (ctx, next) => {
  ctx.body = "Dodex";
});

module.exports = router;
