require("package.json!npm");
/*
 * During the production build you can ignore the "Unable to load CSS in an environment without a document." exception.
 */
steal.import("node_modules/bootstrap/dist/css/bootstrap.min.css").then(function () {
    steal.import("stealjs/appl/css/site.css");    //Make sure site.css loads after bootstrap for sticky nav
});
steal.import("node_modules/tablesorter/dist/css/theme.blue.min.css");
steal.import("node_modules/tablesorter/dist/css/jquery.tablesorter.pager.min.css");  
steal.import("node_modules/font-awesome/css/font-awesome.css");

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
    ;
});
//!steal-remove-end