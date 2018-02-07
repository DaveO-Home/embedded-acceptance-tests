/*global testit:true module:true Stache:true*/
/*eslint no-undef: "error"*/
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

var startsWith = require("lodash/startsWith");
var capitalize = require("lodash/capitalize");

require("bootstrap");
require("tablesorter");

//removeIf(production)
// Specs can be inserted at initialization(before karma is started).
if (typeof testit !== "undefined" && testit) {
    describe("Popper Defined - required for Bootstrap", function () {
        it("is JQuery defined", function () {
            expect(typeof $ === "function").toBe(true);
        });
        it("is Popper defined", function () {
            expect(typeof Popper === "function").toBe(true);
        });
    });
}
//endRemoveIf(production)

var baseScriptsUrl = "~/",
        pathName = window.location.pathname,
        baseUrl = pathName !== "/context.html"
        ? pathName.substring(0, pathName.substring(1, pathName.length).lastIndexOf("/") + 1) + "/"
        : "/base/" + window._bundler + "/appl/";

module.exports = {
    controllers: [],
    init: function (options) {
        options = options || {};
        this.initPage(options);

        $.fn.fa = function (options) {
            options = $.extend({
                icon: "check"
            }, options);
            return this.each(function () {
                var $element = $(this);
                var icon = "<i class='fa fa-" + options.icon + "'> </i>";
                $(icon).appendTo($element);
            });
        };
    },
    initPage: function () {
        $("[data-toggle=collapse]").click(function (e) {
            e.preventDefault();  //Don"t change the hash
            $(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
        });
    },
    toUrl: function (url) {
        // Node Express exception
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
        return startsWith(url, "views/") ? this.toScriptsUrl(url) : this.toUrl(url);
    },
    loadController: function (controllerName, controller, fnLoad, fnError) {
        var me = this;

        if (this.controllers[controllerName]) {
            fnLoad(me.controllers[controllerName]);
        } else {
            var appController = controller;

            try {
//removeIf(production)
                if (testit) {
                    expect(appController).not.toBe(null);
                    expect(typeof fnLoad === 'function').toBe(true);
                }
//endRemoveIf(production)

                me.controllers[capitalize(controllerName)] = appController;

                fnLoad(me.controllers[controllerName]);
            } catch (e) {
                console.error(e);
                fnError();
                return;
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
        //removeIf(production)
        baseUrl = testit ? "/base/" + window._bundler + "/appl/" : baseUrl;
        //endRemoveIf(production)
        var jsonUrl = baseUrl + "templates/tools_ful.json";
        var me = this;

        // fixture({url: "/listools"}, "templates/tools_ful.json");
        $.get(options.templateUrl + options.template, function (source) {
            template = Stache(source);

            $.get(jsonUrl, function (data) {
                //The can.Component/viewModel not working with ES6 - Using normal can.Control event handling on Table controller.
//                var osKeys = ["Combined", "Category1", "Category2"];
//                var values = ["ful", "cat1", "cat2"];
//                Helpers.setJobTypeSelector(Component, CanMap, osKeys, values, template, baseUrl);

                render(template(data));
                currentController.decorateTable(options.template.split(".")[0]);

                var updateTable = function (sender) {
                    var osKeys = ["Combined", "Category1", "Category2"];
                    var values = ["ful", "cat1", "cat2"];
                    var tbodyTemplate = template;
                    var toolsUrl = baseUrl + "templates/tools_";
                    var selectedJobType = getValue(sender.text, osKeys, values);
                    $.get(toolsUrl + selectedJobType + ".json", function (data) {
                        if (selectedJobType == "ful") {
                            data.all = false;
                        }
                        var tbody = tbodyTemplate(data);
                        $(".tablesorter tbody").html(tbody).trigger("update");
                        $("#dropdown1 a i").each(function () {
                            this.remove()
                        });
                        $(sender).fa({icon: "check"});
                    }, "json").fail(function (data, err) {

                        console.error("Error fetching fixture data: " + err);

                    });
                    function getValue(item, keys, values) {
                        for (var idx = 0; idx < keys.length; idx++) {
                            if (keys[idx] === item)
                                return values[idx];
                        }
                    }
                }
                currentController.dropdownEvent = updateTable;
            }, "json").fail(function (data, err) {
                console.error("Error fetching json data: " + err);
            });
        }, "text")
                .fail(function (data, err) {
                    console.error("Error Loading Template: " + err);
                    console.warn(data);
                });
    },
    getValue: function (item, keys, values) {
        for (var idx = 0; idx < keys.length; idx++) {
            if (keys[idx] === item)
                return values[idx];
        }
    }
};
