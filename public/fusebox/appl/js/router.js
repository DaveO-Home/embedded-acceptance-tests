/*global testit:true module:true FuseBox:true*/
/*eslint no-undef: "error"*/
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

var App = require("./app");
var Map = require("can-map");
var Route = require("can-route");
var _ = require("lodash");
var Start = require("start");

var ApplViewModel = Map.extend({
    init: function () {

        Start.initMenu();

    },
    index: function (options) {

        options.fade = false;
        Start.index(options);

    },
    contact: function (ev) {

        Start.contact(ev);

    },
    dispatch: function () {

        var me = this,
                controllerName = _.capitalize(this.controller),
                actionName = this.action
                ? this.action.charAt(0).toLowerCase() + _.camelCase(this.action.slice(1)) : "index",
                failMsg = "Load problem with: \"" + controllerName + "/" + actionName + "\".";

        //The controller will initiate the view. ---> calls basecontrol.view ---> app.loadView
        App.loadController(controllerName, getController(controllerName), function (controller) {

            if (controller &&
                    controller[actionName] &&
                    controller.isValid ? controller.isValid(me) : true) {

                //Execute the controller's action
                controller[actionName](me);

            } else {

                console.error(failMsg);

            }
        }, function (err) {

            console.error(failMsg + " - " + err);

        });
    },
    flush: function () {
        if (typeof FuseBox !== "undefined") {
            FuseBox.flush();
            console.warn("Memory cache flushed");
        }
    },
    login: function () {
        Start.login({});
    }
});

function getController(controllerName) {

    switch (controllerName.toLowerCase()) {
        case "table":
            return require("table");
        case "pdf":
            return require("pdf");
        default:
            break;
    }
}

module.exports = {
    init: function () {
        $(function () {

            var viewModel = new ApplViewModel();

            Route.data = viewModel;

            Route.on("change", function (ev, attr, how, newVal, oldVal) {

                if (attr && newVal === "flush") {
                    this.flush();
                } else
                if (how === "set") {
                    Start.initMenu();
                }

            });

            Route.on("id", function (ev, attr, oldVal) {

                if (attr) {
                    this.dispatch();
                }

            });

            Route.on("action", function (ev, attr, oldVal) {

                if (attr) {
                    /* develblock:start */
                    //Note: we are already in a spec at this time.
                    if (testit && attr !== " ") {
                        var actions = ["tools", "test", undefined];
                        expect(actions.indexOf(attr) !== -1).toBe(true);
                    }
                    /* develblock:end */
                    this.dispatch();
                }

            });
            /*eslint no-unused-vars: "warn"*/
            Route.on("home", function (ev, attr, oldVal) {

                var options = {};

                if (attr) {
                    /* develblock:start */
                    //Note: we are already in a spec at this time.
                    if (testit) {

                        if (Route.data.attr("base")) {

                            expect(attr === "#!").toBe(true);

                        } else {
                            return;  //Just in case Karma loads the index page.
                        }
                        options.base = Route.data.attr("base");
                        options.selector = Route.data.attr("selector");
                    }
                    /* develblock:end */
                    this.index(options);

                }

            });

            Route.on("controller", function (ev, attr, oldVal) {

                if (attr && typeof this[attr] === "function") {

                    this[attr]();

                }
            });

            Route.register("{controller}/{action}/{id}");
            Route.register("{controller}/{action}");
            Route.register("{controller}");
            Route.register("", {home: "#!"});

            Route.start();
        });
        return Route;
    }
};
