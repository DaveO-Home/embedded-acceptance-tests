const { timer } = require('rxjs');

module.exports = {
    toolstest: function (Route, Helpers) {
        /* 
         * Test that new data are loaded when the select value changes.
         */
        describe("Load new tools page", function () {
            var tools;
            var beforeValue;
            var afterValue;
            var spyOnTools;
            var selectorObject;

            beforeAll(function (done) {
                if (!$("#main_container").length) {
                    $("body").append('<div id="main_container"></div>');
                }
                // Loading Application Web Page(Treat as a Fixture)
                Route.data.attr("base", true);
                Route.data.attr("controller", "table");
                Route.data.attr("action", "tools");

                // Wait for Web Page to be loaded
                Helpers.getResource("container", 0, 1)
                    .catch(function (rejected) {
                        fail("The Tools Page did not load within limited time: " + rejected);
                    }).then(function (resolved) {
                        tools = $("#tools");
                        const jqueryTools = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)");
                        beforeValue = jqueryTools.text();
                        spyOnTools =
                            spyOn(jqueryTools,"text").and.callThrough().and.returnValue(beforeValue);

                        beforeValue = jqueryTools.text();

                        selectorObject = $('.jobtype-selector');
                        /*
                         *  The can.Component(jobtype-selector) has a change event - we want to test that.
                         */
                        selectorObject.val("cat1");
                        Helpers.fireEvent(selectorObject[0], 'change');

                        // Note: if page does not refresh, increase the timer time.
                        // Using RxJs instead of Promise.
                        const numbers = timer(50, 50);
                        const observable = numbers.subscribe(timer => {
                            afterValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();
                            spyOnTools.and.callThrough().and.returnValue(afterValue);
                            afterValue = jqueryTools.text();
                            if (spyOnTools.calls.first().returnValue !==
                                    spyOnTools.calls.mostRecent().returnValue || timer === 15) {
                                observable.unsubscribe();
                                done();
                            }
                        })
                    });
            });

            it("setup and change event executed.", function (done) {
                expect(tools[0]).toBeInDOM();
                expect('.disabled').toBeDisabled();

                // Required for Firefox
                selectorObject[0] = document.activeElement;
                expect(selectorObject).toBeFocused();
                expect('.jobtype-selector > option').toHaveLength(4);

                done();
            });

            it("new page loaded on change.", function (done) {
                // Verify that new page was loaded.
                expect(spyOnTools.calls.first().returnValue.length > 0).toBe(true);
                expect(spyOnTools.calls.mostRecent().returnValue.length > 0).toBe(true);
                expect(spyOnTools).toHaveBeenCalled();
                expect(spyOnTools.calls.count() > 1).toBe(true);
                expect(spyOnTools.calls.first().returnValue).not.toBe(spyOnTools.calls.mostRecent().returnValue);

                done();
            });
        });
    }
};