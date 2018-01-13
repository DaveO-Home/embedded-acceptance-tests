
require("./js/utils/set.globals"); 
var App = require("./js/app"),
        Router = require("./js/router"),
        Default = require("./js/utils/default"), 
        Setup = require("./js/utils/setup"), 
        Helpers = require("./js/utils/helpers"),
        Config = require("./js/config")

require("../../node_modules/tablesorter/dist/js/extras/jquery.tablesorter.pager.min.js"); 

App.init(Default);
 
var Route = Router.init();

Setup.init();

//removeIf(production)
//Code between the ..start and ..end tags will be removed by the BlockStrip plugin during the production build.
//testit is true if running under Karma - see testapp_dev.html
if (typeof window.testit !== "undefined" && window.testit) {

    var apptest = require("apptest").apptest;
    
    //Run acceptance tests.
    apptest(Route, Helpers, App);
    
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    setTimeout(function () {
        __karma__.start(); //<===== Very Important - executed here!!
    }, 500); 
}
//endRemoveIf(production)
