
window.jQuery = window.$ = require('jquery');
window._bundler = "browserify";

var App = require("b/app"),
        Router = require("b/router"),
        Default = require("b/default"), 
        Setup = require("b/setup"), 
        Helpers = require("b/helpers"),
        Config = require("b/config");
require("b/pager"); 

App.init(Default);

var Route = Router.init();

Setup.init();

//removeIf(production)
//Code between the ..start and ..end tags will be removed by the BlockStrip plugin during the production build.
//testit is true if running under Karma - see testapp_dev.html
if (typeof window.testit !== "undefined" && window.testit) {
    var apptest = require("b/apptest").apptest;
    
    //Run acceptance tests.
    apptest(Route, Helpers, App);
}
//endRemoveIf(production)
