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
new Promise((resolve, reject) => {
    setTimeout(function () {
        resolve(0)
    }, 500)
}).catch(rejected => {
    fail(`Error ${rejected}`)
}).then(resolved => {
    if (typeof testit !== "undefined" && testit) {
        var apptest = require("apptests")
        // Run acceptance tests. - To run only unit tests, comment the apptest call.
        apptest(Route, Helpers, App)
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
        __karma__.start()
    }
})
/* develblock:end */