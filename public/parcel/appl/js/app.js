
import Helpers from "./utils/helpers";
import Component from "can-component";
import Map from "can-map";
import capitalize from "lodash/capitalize";
import { createPopper } from "@popperjs/core";
import "bootstrap";
import "tablesorter";

// Specs can be inserted anywhere in the application at initialization before __karma__.start()           
/* develblock:start */
if (testit) {
    describe("Popper Defined - required for Bootstrap", function () {
        it("is JQuery defined", function () {
            expect(typeof $ === "function").toBe(true);
        });

        it("is Popper defined", function () {
            expect(typeof createPopper === "function").toBe(true);
        });
    });
}
/* develblock:end */

module.exports = {
    controllers: [],
    init: function (options) {
        options = options || {};
        this.initPage(options);
    },
    initPage: function () {
        $("[data-toggle=collapse]").trigger("click", (e) => {
            e.preventDefault();  //Don't change the hash
            $(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
        });
    },
    toUrl: function (url) {
        return url;
    },
    toScriptsUrl: function (url) {
        return url;
    },
    toViewsUrl: function (url) {
        return url;
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
                            expect(typeof fnLoad === "function").toBe(true);
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
            var resolvedUrl = options.url;
            var currentController = this.controllers[capitalize(options.controller)];

            if (options.url) {
                $.get(resolvedUrl, fnLoad)
                    .done(function (data, err) {
                        if (typeof currentController !== "undefined" && currentController.finish) {
                            currentController.finish(options);
                        }
                        if (err !== "success") {
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
        
        //fixture({url: '/listools'}, 'templates/tools_ful.json');
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
