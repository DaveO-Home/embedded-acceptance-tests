const { timer } = require("rxjs");

module.exports = {
    toolstest: (Route, Helpers) => {
        /* 
         * Test that new data are loaded when the select value changes.
         */
        describe("Load new tools page", () => {
            var tools;
            var beforeValue;
            var afterValue;
            var selectorObject;
            var selectorItem;

            beforeAll((done) => {
                //Loading Application Web Page(Treat as a Fixture)
                Route.data.attr("base", true);
                Route.data.attr("controller", "table");
                Route.data.attr("action", "tools");

                //Wait for Web Page to be loaded
                Helpers.getResource("container", 0, 1)
                    .catch((rejected) => {
                        fail("The Tools Page did not load within limited time: " + rejected);
                    }).then(() => {
                        tools = $("#tools");
                        beforeValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();
                        // Opens the dropdown
                        selectorObject = $("#dropdown0");
                        Helpers.fireEvent(selectorObject[0], "click");

                        selectorItem = $("a.dropdown-item.smallerfont");

                        done();
                    });
            });

            it("setup and click events executed.", (done) => {
                Helpers.fireEvent(selectorItem[1], "click");

                // Note: if page does not refresh, increase the timer time.
                // Using RxJs instead of Promise.
                const numbers = timer(50, 50);
                const observable = numbers.subscribe(timer => {
                    afterValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();
                    if (afterValue !== beforeValue || timer === 20) {
                        expect(tools[0]).toBeInDOM();
                        expect(".disabled").toBeDisabled();
                        expect("#dropdown1 a").toHaveLength(3);
                        expect(selectorObject).toBeFocused();
                        observable.unsubscribe();
                        done();
                    }
                });
            });

            it("new page loaded on change.", () => {
                //Verify that new page was loaded.
                expect(beforeValue).not.toBe(afterValue);
            });
        });
    }
};