if (!window.__karma__) {
    window.testit = false;
}
window._bundler = "webpack";

var App = require("app");
var Router = require("router");
var Default = require("default");
var Setup = require("setup");
var Helpers = require("helpers");
require("config");

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
    var apptest = require("apptests")
    // Run acceptance tests.
    apptest(Route, Helpers, App)
}
/* develblock:end */