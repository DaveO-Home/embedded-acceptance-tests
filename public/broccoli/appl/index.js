/* develblock:start */
window._bundler = "broccoli";
require('can-debug')
/* develblock:end */
require("./js/utils/set.globals")
var App = require("./js/app");
var Router = require("./js/router");
var Default = require("./js/utils/default");
var Setup = require("./js/utils/setup");
var Helpers = require("./js/utils/helpers");
/* eslint no-unused-vars: 0 */
var Config = require("./js/config");
require("../../node_modules/tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js");

App.init(Default);

var Route = Router.init();

Setup.init();

/* develblock:start */
//Code between the ..start and ..end tags will be removed by the BlockStrip plugin during the production build.
//testit is true if running under Karma - see testapp_dev.html
if (typeof testit !== "undefined" && testit) {
    
    var apptest = require("./jasmine/apptest").apptest;

    //Run acceptance tests. - To run only unit tests, comment the apptest call.
    apptest(Route, Helpers, App);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    setTimeout(function () {
        __karma__.start();  //<===== Very Important - executed here!!
    }, 500);

}
/* develblock:end */
