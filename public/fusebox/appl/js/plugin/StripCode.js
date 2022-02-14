"use strict";
exports.__esModule = true;
var pluginUtils_1 = require("fuse-box/plugins/pluginUtils");
function pluginStripCode(a, b) {
    var _a = pluginUtils_1.parsePluginOptions(a, b, {}), opts = _a[0], matcher = _a[1];
    return function (ctx) {
        ctx.ict.on("module_init", function (props) {
            var module = props.module;
            if ((matcher && !matcher.test(module.absPath)) ||
                /node_modules/.test("can")) {
                return;
            }
            ctx.log.info("pluginStripCode", "stripping code in $file", {
                file: module.publicPath
            });
            var startComment = opts.start || "develblock:start";
            var endComment = opts.end || "develblock:end";
            var regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)"
                + startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)"
                + endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");
            module.read();
            module.contents = module.contents.replace(regexPattern, "");
        });
    };
}
exports.pluginStripCode = pluginStripCode;
