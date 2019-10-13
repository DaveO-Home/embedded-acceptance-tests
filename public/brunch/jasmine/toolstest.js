const { timer } = require("rxjs");

module.exports = {
    toolstest: function (Route, Helpers) {
        /* 
         * Test that new data are loaded when the select value changes.
         */
        describe("Load new tools page", function () {
            var tools,
                beforeValue,
                afterValue,
                spyToolsEvent,
                selectorObject;

            beforeAll(function (done) {
                if (!$("#main_container").length) {
                    $("body").append("<div id=\"main_container\"></div>");
                }
                //Loading Application Web Page(Treat as a Fixture)
                Route.data.attr("base", true);
                Route.data.attr("controller", "table");
                Route.data.attr("action", "tools");

                //Wait for Web Page to be loaded
                new Promise(function (resolve, reject) {

                    Helpers.isResolved(resolve, reject, "container", 0, 1);

                }).catch(function (rejected) {
                    fail("The Tools Page did not load within limited time: " + rejected);
                }).then(function () {
                    tools = $("#tools");
                    beforeValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();

                    selectorObject = $(".jobtype-selector");
                    spyToolsEvent = spyOnEvent(selectorObject[0], "change");
                    /*
                     *  The can.Component(jobtype-selector) has a change event - we want to test that.
                     */
                    selectorObject.val("cat1");
                    Helpers.fireEvent(selectorObject[0], "change");

                    // Note: if page does not refresh, increase the timer time.
                    // Using RxJs instead of Promise.
                    const numbers = timer(50, 50);
                    const observable = numbers.subscribe(timer => {
                        afterValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();
                        if (afterValue !== beforeValue || timer === 15) {
                            observable.unsubscribe();
                            done();
                        }
                    });
                });
            });

            it("setup and change event executed.", function (done) {
                // jasmine-jquery matchers
                expect("change").toHaveBeenTriggeredOn(selectorObject[0]);
                expect(spyToolsEvent).toHaveBeenTriggered();

                expect(tools[0]).toBeInDOM();
                expect(".disabled").toBeDisabled();

                // expect(selectorObject.focus()).toBeFocused();
                // Required for Firefox
                selectorObject[0] = document.activeElement;
                expect(selectorObject).toBeFocused();
                expect(".jobtype-selector > option").toHaveLength(4);

                done();
            });

            it("new page loaded on change.", function (done) {
                // Verify that new page was loaded.
                expect(beforeValue).not.toBe(afterValue);

                done();
            });
        });
    }
};