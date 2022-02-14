require("package.json!npm");
var steal = require("@steal");
var { marked } = require("../../../node_modules/marked/marked.min.js");
global.marked = marked;
steal.config({
    // Using cdn - bootstrap 5 "rest parameters" not transpiling with steal-tools
    paths: {"bootstrap": "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"},
    envs: {
    "production": {
        "map": {
            "bootstrap": "@empty"
        }
    }
}});

//!steal-remove-start
/*
 * Startup live-reload in another window first - gulp hmr
 */
// steal.import("live-reload").then(reload => {
// //Only use outside of Karma 
//     if (typeof testit === "undefined" || !testit) {
//         reload("*", function () {
//             //If not modifying a controller module(dynamically loaded) reload is faster if commented.
// //          App.controllers = [];
//         });
//     }
// });
//!steal-remove-end
