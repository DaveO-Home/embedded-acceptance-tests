
var capitalize = require("lodash/capitalize");
var  { createPopper } = require("@popperjs/core");
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
            expect(typeof createPopper === "function").toBe(true);
        });
    });
}
//endRemoveIf(production)

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
                const $element = $(this.target ? this.target : this);
                const icon = `<i class='fa fa-${options.icon}'> </i>`;
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
                //removeIf(production)
                if (testit) {
                    expect(appController).not.toBe(null);
                    expect(typeof fnLoad === "function").toBe(true);
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

        // fixture({url: "/listools"}, "templates/tools_ful.json");
        $.get(options.templateUrl + options.template, function (source) {
            template = Stache(source);

            $.get(jsonUrl, function (data) {
                //The can.Component/viewModel not working with ES6 - Using normal can.Control event handling on Table controller.
                //                var osKeys = ["Combined", "Category1", "Category2"];
                //                var values = ["ful", "cat1", "cat2"];
                //                Helpers.setJobTypeSelector(Component, CanMap, osKeys, values, template);
                render(template(data));
                currentController.decorateTable(options.template.split(".")[0]);

                var updateTable = function (sender) {
                    var osKeys = ["Combined", "Category1", "Category2"];
                    var values = ["ful", "cat1", "cat2"];
                    var tbodyTemplate = template;
                    var toolsUrl = "templates/tools_";
                    var selectedJobType = getValue(sender.target.innerText, osKeys, values);
                    if (typeof selectedJobType === "undefined") {
                        return;
                    }
                    $.get(toolsUrl + selectedJobType + ".json", function (data) {
                        if (selectedJobType == "ful") {
                            data.all = false;
                        }
                        var tbody = tbodyTemplate(data);
                        $(".tablesorter tbody").html(tbody).trigger("update");
                        $("#dropdown1 a svg").each(function () { 
                            this.remove(); 
                        });
                        $(sender).fa({ icon: "check" });
                    }, "json").fail(function (data, err) {

                        console.error("Error fetching fixture data: " + err, data);

                    });
                    function getValue(item, keys, values) {
                        for (var idx = 0; idx < keys.length; idx++) {
                            if (keys[idx] === item)
                                return values[idx];
                        }
                    }
                };
                currentController.dropdownEvent = updateTable;
                $("#dropdown1").on("click", currentController.dropdownEvent);
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
