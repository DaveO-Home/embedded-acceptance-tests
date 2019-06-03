
var routerTest = require("routertest").routertest;
var domTest = require("domtest").domtest;
var toolsTest = require("toolstest").toolstest;
var contactTest = require("contacttest").contacttest;
var loginTest = require("logintest").logintest;
var dodexTest = require("dodextest").dodextest;
var mainContainer = "#main_container";
var Start = require("../js/controller/start");

exports.apptest = function (Route, Helpers, App, dodex, content) {
    describe("Application Unit test suite - AppTest", function () {
        beforeAll(function (done) {
            /* Important!
             * Make sure the div container is added to the Karma page
             */
            $.get("app_bootstrap.html", function (data) {
                $("body").prepend(data)
                done()
            }, "html").fail(function (data, err) {
                console.warn("Error fetching fixture data: " + err);
                done()
            });

            spyOn(Route.data, 'index').and.callThrough();
            spyOn(Route.data, 'dispatch').and.callThrough();
        }, 10000);

        afterEach(function () {
            //Get rid of nasty warning message from can-events.
            $("#tools thead tr td input").each(function () {
                this.disabled = false;
            });
            $(mainContainer).empty();
        });

        afterAll(function () {
            $(mainContainer).remove();
        }, 5000);

        it("Is Welcome Page Loaded", function (done) {
            /*  
             * Loading Welcome page.
             */
            Route.data.attr("base", "true");
            Route.data.attr("selector", mainContainer);
            Route.data.attr("home", "");
            Route.data.attr("home", "#!");
            //Waiting for page to load.
            Helpers.getResource("container", 0, 1)
                .catch(function (rejected) {
                    fail("The Welcome Page did not load within limited time: " + rejected);
                }).then(function (resolved) {
                    if (resolved) {
                        expect(Route.data.index).toHaveBeenCalled();
                        expect(Route.data.index.calls.count()).toEqual(1);
                        expect(App.controllers["Start"]).not.toBeUndefined();
                        expect($(mainContainer).children().length > 1).toBe(true);

                        domTest("index");
                    }

                    done();
                });
        });

        it("Is Tools Table Loaded", function (done) {
            /* Letting the Router load the appropriate page.
             * The hash change event should load the resource.
             */
            Route.data.attr("controller", "table");
            Route.data.attr("action", "tools");

            Helpers.getResource("container", 0, 1)
                .catch(function (rejected) {
                    fail("The Tools Page did not load within limited time: " + rejected);
                }).then(function (resolved) {
                    if (resolved) {
                        expect(App.controllers["Table"]).not.toBeUndefined();
                        expect($(mainContainer).children().length > 1).toBe(true);

                        domTest("tools");
                    }

                    done();
                });
        });

        routerTest(Route, "table", "tools", null);

        it("Is Pdf Loaded", function (done) {
            var count = Route.data.dispatch.calls.count();
            Route.data.attr("controller", "pdf");
            Route.data.attr("action", "test");

            Helpers.getResource("container", 0, 0)
                .catch(function (rejected) {
                    fail("The Pdf Page did not load within limited time: " + rejected);
                }).then(function (resolved) {
                    if (resolved) {
                        expect(Route.data.dispatch.calls.count()).not.toEqual(count);
                        expect(App.controllers["Pdf"]).not.toBeUndefined();
                        expect($(mainContainer).children().length > 0).toBe(true);

                        domTest("pdf");
                    }

                    done();
                });
        });

        routerTest(Route, "pdf", "test", null);

        //Executing here makes sure the tests are run in sequence.
        //Spec to test if page data changes on select change event.
        toolsTest(Route, Helpers);

        //Form Validation
        contactTest(Route, Helpers);
        //Verify modal form
        loginTest(Start);
        //Test dodex
        dodexTest(dodex, content, Start);

        if (testOnly) {
            it("Testing only", function () {
                fail("Testing only, build will not proceed");
            });
        }
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        __karma__.start();
    });
};