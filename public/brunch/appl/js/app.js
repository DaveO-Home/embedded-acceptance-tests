/*global testit:true module:true Stache:true*/
/*eslint no-undef: "error"*/
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

var Helpers = require("./utils/helpers");
var Component = require("can-component");
var Map = require("can-map");
var startsWith = require("lodash/startsWith");
var capitalize = require("lodash/capitalize");

require("bootstrap");
require("tablesorter");

// Specs can be inserted anywhere in the application at initialization before __karma__.start()           
/* develblock:start */
if (testit) {
    describe("Popper Defined - required for Bootstrap", function () {
        it("is JQuery defined", function () {
            expect(typeof $ === "function").toBe(true);
        });

        it("is Popper defined", function () {
            expect(typeof Popper === "function").toBe(true);
        });
    });
}
/* develblock:end */

var baseScriptsUrl = "~/";
var pathName = window.location.pathname;
var baseUrl = pathName
        ? pathName.substring(0, pathName.substring(1, pathName.length).indexOf("/") + 1) + "/appl"
        : "/base/" + window._bundler + "/appl/";

module.exports = {
    controllers: [],
    init: function (options) {
        options = options || {};
        this.initPage(options);
    },
    initPage: function () {
        $("[data-toggle=collapse]").click(function (e) {
            e.preventDefault();  //Don"t change the hash
            $(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
        });
    },
    toUrl: function (url) {
        //Node Express exception
        if (startsWith(baseUrl, "/appl/")) {
            baseUrl = "/appl";
        }

        if (url && url.indexOf("~/") === 0) {
            url = baseUrl + url.substring(2);
        }
        return url;
    },
    toScriptsUrl: function (url) {
        return this.toUrl(baseScriptsUrl + "/" + url);
    },
    toViewsUrl: function (url) {
        return startsWith(url, "views/") ? url : this.toUrl(url);
    },
    loadController: function (controllerName, controller, fnLoad, fnError) {
        var me = this;

        if (this.controllers[controllerName]) {
            fnLoad(me.controllers[controllerName]);
        } else {
            var appController = controller;

            try {
/* develblock:start */
                if (testit) {
                    describe("Application Controller", function () {
                        it("Loaded Controller", function () {
                            expect(appController).not.toBe(null);
                            expect(typeof fnLoad === 'function').toBe(true);
                        });
                    });
                }
/* develblock:end */
                me.controllers[capitalize(controllerName)] = appController;

                fnLoad(me.controllers[controllerName]);
            } catch (e) {
                console.error(e);
                fnError();
            }
        }
    },
    loadView: function (options, fnLoad) {
        if (options && fnLoad) {
            var resolvedUrl = this.toViewsUrl(options.url);
            var currentController = this.controllers[capitalize(options.controller)];

            if (options.url) {
                $.get(resolvedUrl, fnLoad)
                        .done(function (data, err) {
                            if (typeof currentController !== "undefined" && currentController.finish) {
                                currentController.finish(options);
                            }
                            if (err !== 'success') {
                                console.error(err);
                            }
                        });
            } else if (options.local_content) {
                fnLoad(options.local_content);
                
                if (typeof currentController !== "undefined" && currentController.finish) {
                    currentController.finish(options);
                }
            }
        }
    },
    renderTools: function (options, render) {
        var currentController = this.controllers[capitalize(options.controller)];
        var template;
        var jsonUrl = "templates/tools_ful.json";
        /* develblock:start */
        if (testit) {
            baseUrl = "/base/" + window._bundler + "/appl/";
            jsonUrl = baseUrl + jsonUrl;
            
        }
        /* develblock:end */
        //fixture({url: "/listools"}, "templates/tools_ful.json");
        $.get(options.templateUrl + options.template, function (source) {
            template = Stache(source);

            $.get(jsonUrl, function (data) {
                var osKeys = ["Combined", "Category1", "Category2"];
                var values = ["ful", "cat1", "cat2"];

                Helpers.setJobTypeSelector(Component, Map, osKeys, values, template);
                render(template(data));
                currentController.decorateTable(options.template.split(".")[0]);
            }, "json").fail(function (data, err) {
                console.error("Error fetching json data: " + err);
            });
        }, "text")
                .fail(function (data, err) {
                    console.error("Error Loading Template: " + err);
                    console.warn(data);
                });
    }
};
