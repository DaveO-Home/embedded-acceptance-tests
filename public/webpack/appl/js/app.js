
define("app", [
    "helpers",
    "lodash",
    "bootstrap",
    "tablesorter",
    "tablepager"
], function (Helpers, _) {
    /* develblock:start */
    // Specs can be inserted at module initialization(before karma is started).

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
    return {
        controllers: [],
        init: function () {
            this.initPage();
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
        loadController: function (controller, fnLoad/*, fnError*/) {
            var me = this;

            if (this.controllers[controller]) {
                fnLoad(me.controllers[controller]);
            } else {
                var appController;
                switch (controller.toLowerCase()) {
                    case "table":
                        appController = require("./controller/table");
                        break;
                    case "pdf":
                        appController = require("./controller/pdf");
                        break;
                    default:
                        break;
                }
                /* develblock:start */
                if (testit) {
                    expect(appController).not.toBe(null);
                    expect(typeof fnLoad === "function").toBe(true);
                }
                /* develblock:end */
                setTimeout(function () {
                    me.controllers[_.capitalize(controller)] = appController;
                    fnLoad(me.controllers[controller]);
                }, 10);
            }
        },
        loadView: function (options, fnLoad) {
            if (options && fnLoad) {
                var resolvedUrl = this.toViewsUrl(options.url);
                var currentController = this.controllers[_.capitalize(options.controller)];

                if (options.url) {
                    $.get(resolvedUrl, fnLoad)
                        // eslint-disable-next-line no-unused-vars
                        .done(function (data, err) {
                            if (typeof currentController !== "undefined" && currentController.finish) {
                                currentController.finish(options);
                            }
                        })
                        .fail(function (status) {
                            console.warn("Ajax Get Failure:", status);
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
            var currentController = this.controllers[_.capitalize(options.controller)];

            var template = Stache(options.source);

            var osKeys = ["Combined", "Category1", "Category2"];
            var values = ["ful", "cat1", "cat2"];

            Helpers.setJobTypeSelector(osKeys, values, template);

            render(template(require("templates/tools_ful.json")));
            currentController.decorateTable(options.template.split(".")[0]);
        }
    };
});
