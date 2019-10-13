import App from "./js/app";
import Router from "router";
import Default from "default";
import Setup from "setup";
import Helpers from "helpers";
import "config";
App.init(Default);
var Route = Router.init();
Setup.init(App, Route, Helpers);
if (typeof steal !== "undefined") {
    steal.dev.log("App Started");
}
var testModules;
Promise.all([
    System.import("../tests/routertest"),
    System.import("../tests/domtest"),
    System.import("../tests/toolstest")
]).then(function (modules) {
    testModules = modules;
    if (typeof testit !== "undefined" && testit) {
        System.import("../tests/apptest").then(function (apptest) {
            apptest(Route, Helpers, App, testModules);
            __karma__.start();
        });
    }
});