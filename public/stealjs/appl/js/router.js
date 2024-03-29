// import { route } from "can";
steal("app",
    "can-map",
    "can-route",
    "start",
    "lodash",
    function (App, Map, Route, Start, _) {
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
                    actionName = this.action ?
                        this.action.charAt(0).toLowerCase() + _.camelCase(this.action.slice(1)) : "index",
                    failMsg = "Load problem with: \"" + controllerName + "/" + actionName + "\".";

                //The controller will initiate the view. ---> calls basecontrol.view ---> app.loadView
                App.loadController(controllerName, function (controller) {
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
        return {
            init: function () {
                $(function () {
                    var viewModel = new ApplViewModel();

                    Route.data = viewModel;
                    // eslint-disable-next-line no-unused-vars
                    Route.on("change", function (ev, attr, how, newVal, oldVal) {
                        if (how === "set") {
                            Start.initMenu();
                        }
                    });

                    // eslint-disable-next-line no-unused-vars
                    Route.on("id", function (ev, attr, oldVal) {
                        if (attr) {
                            this.dispatch();
                        }
                    });

                    // eslint-disable-next-line no-unused-vars
                    Route.on("action", function (ev, attr, oldVal) {
                        if (attr) {
                            //!steal-remove-start
                            //Note: we are already in a spec at this time.
                            if (testit && attr !== " ") {
                                var actions = ["tools", "test", undefined];
                                expect(actions.indexOf(attr) !== -1).toBe(true);
                            }
                            //!steal-remove-end                           
                            this.dispatch();
                        }
                    });

                    // eslint-disable-next-line no-unused-vars
                    Route.on("home", function (ev, attr, oldVal) {
                        var options = {};

                        if (attr) {
                            //!steal-remove-start
                            //Note: we are already in a spec at this time.
                            if (testit) {
                                if (Route.data.attr("base")) {
                                    expect(attr === "#!").toBe(true);
                                } else {
                                    return;  //Just in case Karma loads the index page.
                                }
                                options.selector = Route.data.attr("selector");
                            }
                            //!steal-remove-end
                            this.index(options);
                        }

                    });

                    // eslint-disable-next-line no-unused-vars
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
    });
