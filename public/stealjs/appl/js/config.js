require("package.json!npm");
var steal = require("@steal");

//!steal-remove-start
/*
 * Startup live-reload in another window first - gulp hmr
 */
steal.import("live-reload").then(reload => {
//Only use outside of Karma 
    if (typeof testit === "undefined" || !testit) {
        reload("*", function () {
            //If not modifying a controller module(dynamically loaded) reload is faster if commented.
//          App.controllers = [];
        });
    }
});
//!steal-remove-end
