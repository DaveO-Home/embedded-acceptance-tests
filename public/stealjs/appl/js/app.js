
// import Helpers from "helpers"
// import Component from 'can-component'
// import Map from 'can-map'

steal("helpers",
    "can-component",
    "can-map",
    "lodash",
    "popper",
    "bootstrap",
    "tablesorter",
    "tablepager",
    "tablewidgets",
    function (Helpers, Component, Map, _) {
        if (typeof window !== undefined) {
            window._bundler = "stealjs";
        }
        // Describe can be inserted in initialization of module.         
        //!steal-remove-start
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
        //!steal-remove-end   
        var baseScriptsUrl = "~/",
            pathName = window.location.pathname,
            baseUrl = pathName !== "/context.html"
                ? pathName.substring(0, pathName.substring(1, pathName.length).lastIndexOf("/") + 1) + "/"
                : "/base/" + window._bundler + "/appl/";

        return {
            // export default {
            controllers: [],
            init: function (options) {
                options = options || {};
                this.initPage();
            },
            initPage: function () {
                $("[data-toggle=collapse]").click(function (e) {
                    e.preventDefault();  // Don"t change the hash
                    $(this).find("i").toggleClass("fa-chevron-right fa-chevron-down");
                });
            },
            toUrl: function (url) {
                // Node Express exception
                if (_.startsWith(baseUrl, "/appl/")) {
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
                return _.startsWith(url, "views/") ? this.toScriptsUrl(url) : this.toUrl(url);
            },
            loadController: function (controller, fnLoad, fnError) {
                var me = this;
                if (this.controllers[controller]) {
                    fnLoad(me.controllers[controller]);
                } else {
                    steal.loader.import(controller.toLowerCase()).then(function (appController) {
                        //!steal-remove-start
                        if (testit) {
                            expect(appController).not.toBe(null);
                            expect(typeof fnLoad === 'function').toBe(true);
                        }
                        //!steal-remove-end 

                        me.controllers[_.capitalize(controller)] = appController;
                        fnLoad(me.controllers[controller]);
                    }, fnError);
                }
            },
            loadView: function (options, fnLoad) {
                if (options && fnLoad) {
                    var resolvedUrl = this.toViewsUrl(options.url);

                    var currentController = this.controllers[_.capitalize(options.controller)];

                    if (options.url) {
                        $.get(resolvedUrl, fnLoad)
                            .done(function (data) {

                                if (typeof currentController !== "undefined" && currentController.finish) {
                                    currentController.finish(options);
                                }
                            })
                            .fail(function (status) {
                                console.error("Ajax Get Failure:", status);
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
                var template;
                //!steal-remove-start
                baseUrl = testit ? "/base/" + window._bundler + "/appl/" : baseUrl;
                //!steal-remove-end
                var jsonUrl = baseUrl + "templates/tools_ful.json";

                $.get(options.templateUrl + options.template, function (source) {
                    template = Stache(source);

                    $.get(jsonUrl, function (data) {
                        var osKeys = ["Combined", "Category1", "Category2"];
                        var values = ["ful", "cat1", "cat2"];

                        Helpers.setJobTypeSelector(Component, Map, osKeys, values, template, baseUrl);
                        //!steal-remove-start
                        if (testit) {  //Firefox issueing disable Warnings with render instead of unload
                            data.base = true;  //Don't include disabled class
                        }
                        //!steal-remove-end

                        render(template(data));

                        currentController.decorateTable(options.template.split(".")[0]);
                    }, "json").fail(function (data, err) {
                        console.error("Error fetching json data: " + err);
                    });
                }, "text")
                    .fail(function (data, err) {
                        console.error("Error Loading Template: " + err);
                        console.log(data);
                    });
            }
        };
    });

