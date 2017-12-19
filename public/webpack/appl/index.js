if (!window.__karma__) {
    window.testit = false;
}
window._bundler = "webpack";

var App = require("app"), 
        Router = require("router"),
        Default = require("default"),
        Setup = require("setup"),
        Helpers = require("helpers"),
        Config = require("config");

App.init(Default);

var Route = Router.init();

Setup.init(App, Route, Helpers);

if (typeof steal !== "undefined") {
    steal.dev.log("App Started");
}

/* develblock:start */
//Code between the ..start and ..end tags will be removed by webpack during the production build.
//testit is true if running under Karma - see testapp_dev.html
if (typeof testit !== "undefined" && testit) {

    Promise.all([System.import("routertests"),
        System.import("domtests"),
        System.import("toolstests"),
        System.import("contacttests"),
        System.import("logintests")]).then(function (modules) {

        if (typeof testit !== "undefined" && testit) {
            //Run acceptance tests.
            Route.data.attr("base", true)
            System.import("apptests").then(function (apptest) {
             
                apptest(Route, Helpers, App, modules);
                __karma__.start();  //<===== Very Important - executed here!!

            });
        }
    });
}
/* develblock:end */