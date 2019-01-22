define(function () {
    return function (Route, Helpers) {
        var {timer} = require("rxjs")
        /* 
         * Test that new data are loaded when the select value changes.
         */
        describe("Load new tools page", function () {
            var tools;
            var beforeValue;
            var afterValue;
            var spyToolsEvent;
            var selectorObject;

            beforeAll(function (done) {
                // if (!$("#main_container").length) {
                //     $("body").append('<div id="main_container"></div>');
                // }
                //Loading Application Web Page(Treat as a Fixture)
                Route.data.attr("base", true);
                Route.data.attr("controller", "table");
                Route.data.attr("action", "tools");

                // Wait for Web Page to be loaded
                Helpers.getResource("container", 0, 1)
                    .catch(function (rejected) {
                        fail("The Tools Page did not load within limited time: " + rejected);
                    }).then(function (resolved) {
                        tools = $("#tools");
                        beforeValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();

                        selectorObject = $('.jobtype-selector');
                        spyToolsEvent = spyOnEvent(selectorObject[0], 'change');
                        /*
                         *  The can.Component(jobtype-selector) has a change event - we want to test that.
                         */
                        selectorObject.val("cat1");
                        Helpers.fireEvent(selectorObject[0], 'change');

                        // Note: if page does not refresh, increase the timer time.
                        // Using RxJs instead of Promise.
                        var numbers = timer(50, 50);
                        var observable = numbers.subscribe(timer => {
                            afterValue = tools.find('tbody').find('tr:nth-child(1)').find('td:nth-child(2)').text()
                            if (afterValue !== beforeValue || timer === 15) {
                                observable.unsubscribe();
                                done();
                            }
                        })
                    });
            });

            it("setup and change event executed.", function () {
                // jasmine-jquery matchers
                expect('change').toHaveBeenTriggeredOn(selectorObject[0]);
                expect(spyToolsEvent).toHaveBeenTriggered();

                expect(tools[0]).toBeInDOM();
                expect('.disabled').toBeDisabled();
                // expect(selectorObject.focus()).toBeFocused();
                expect('.jobtype-selector > option').toHaveLength(4);
                // Required for Firefox
                selectorObject.focusout(function () {
                    setTimeout(function () {
                        expect($(this).focus()).toBeFocused();
                    }, 0);
                });
            });

            it("new page loaded on change.", function () {
                //Verify that new page was loaded.
                expect(beforeValue).not.toBe(afterValue);
            });
        });
    };
});