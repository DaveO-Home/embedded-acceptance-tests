
steal(function () {
    return function (Route, Helpers, App, dodex, input, content) {
        steal.import("routertest",
            "domtest",
            "toolstest",
            "contacttest",
            "logintest",
            "dodextest",
            "inputtest").then(function (modules) {
                var routerTest = modules[0];
                var domTest = modules[1];
                var toolsTest = modules[2];
                var contacttest = modules[3];
                var logintest = modules[4];
                var dodextest = modules[5];
                var inputtest = modules[6];
                var mainContainer = "#main_container";

                describe("Application test suite - AppTest", function () {
                    beforeAll(function (done) {
                        /* Important!
                         * Make sure the spa main bootstrap layout is added to the Karma page
                         */
                        $.get("base/stealjs/appl/app_bootstrap.html", function (data) {
                            $("body").prepend(data)
                            done()
                        }, "html").fail(function (data, err) {
                            console.warn("Error fetching fixture data: " + err);
                            done()
                        });
                        spyOn(Route.data, 'index').and.callThrough();
                        spyOn(Route.data, 'dispatch').and.callThrough();
                    }, 4000);

                    afterEach(function () {
                        $(mainContainer).empty();
                        $(mainContainer).append('<div class="loading-page"></div>');
                    });

                    afterAll(function () {
                        $(".remove").remove();
                        window.scrollTo(0, 0);
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
                        Helpers.getResource("container", 0)
                            .catch(resolved => {
                                fail("The Welcome Page did not load within limited time: " + rejected)
                            }).then(resolved => {
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
                        Helpers.getResource("container", 0)
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

                        $(mainContainer).empty();
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

                    // Spec to test if page data changes on select change event.
                    toolsTest(Route, Helpers);
                    // Form Validation
                    contacttest(Route, Helpers);
                    // Verify modal form
                    logintest();
                    //Test dodex
                    dodextest(dodex, input, content);
                    //Test dodex input
                    inputtest(dodex);

                    // Start the tests - includes steal based unit tests
                    window.tests()

                    if (testOnly) {
                        it("Testing only", function () {
                            fail("Testing only, build will not proceed");
                        });
                    }
                });
            });
    };
});
