
var App = require("./app");
var Map = require("can-map");
var Route = require("can-route");
var capitalize = require("lodash/capitalize");
var camelCase = require("lodash/camelCase");
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
            controllerName = capitalize(this.controller),
            actionName = this.action
                ? this.action.charAt(0).toLowerCase() + camelCase(this.action.slice(1)) : "index",
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
                    //removeIf(production)
                    //Note: we are already in a spec at this time.
                    if (testit && attr !== " ") {
                        var actions = ["tools", "test", undefined];
                        expect(actions.indexOf(attr) !== -1).toBe(true);
                    }
                    //endRemoveIf(production)                           
                    this.dispatch();
                }
            });
            /*eslint no-unused-vars: "warn"*/
            Route.on("home", function (ev, attr, oldVal) {
                var options = {};

                if (attr) {
                    //removeIf(production)
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
                    //endRemoveIf(production)
                    this.index(options);
                }
            });

            Route.on("controller", function (ev, attr, oldVal) {
                if (attr && typeof this[attr] === "function") {
                    this[attr](ev);
                }
            });

            Route.register("{controller}/{action}/{id}");
            Route.register("{controller}/{action}");
            Route.register("{controller}");
            Route.register("", { home: "#!" });

            Route.start();
        });
        return Route;
    }
};
