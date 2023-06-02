const { timer } = require("rxjs");

module.exports = {
    toolstest: (Route, Helpers) => {
        /* 
         * Test that new data are loaded when the select value changes.
         */
        describe("Load new tools page", () => {
            var tools,
                beforeValue,
                afterValue,
                spyBefore,
                spyAfter,
                selectorObject,
                toolsObject;

            beforeAll((done) => {
                if (!$("#main_container").length) {
                    $("body").append("<div id=\"main_container\"></div>");
                }
                // Loading Application Web Page(Treat as a Fixture)
                Route.data.attr("base", true);
                Route.data.attr("controller", "table");
                Route.data.attr("action", "tools");

                // Wait for Web Page to be loaded
                Helpers.getResource("container", 0, 1)
                    .catch((rejected) => {
                        fail("The Tools Page did not load within limited time: " + rejected);
                    }).then(() => {
                        tools = $("#tools");
                        beforeValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();

                        toolsObject = {
                          beforeValue: "",
                          afterValue: "",
                          get before() {
                            return this.beforeValue;
                          },
                          get after() {
                            return this.afterValue;
                          },
                          set after(value) {
                            return this.afterValue = value;
                          }
                        };

                        selectorObject = $(".jobtype-selector");

                        spyBefore = spyOnProperty(toolsObject, "before", "get");
                        spyAfter = spyOnProperty(toolsObject, "after", "get");
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
                                spyBefore.and.returnValue(beforeValue);
                                spyAfter.and.returnValue(afterValue);

                                observable.unsubscribe();
                                done();
                            }
                        });
                    });

            });

            it("setup and change event executed.", (done) => {
                expect(tools[0]).toBeInDOM();
                expect(".disabled").toBeDisabled();

                // Required for Firefox
                selectorObject[0] = document.activeElement;
                expect(selectorObject).toBeFocused();
                expect(".jobtype-selector > option").toHaveLength(4);

                done();
            });

            it("new page loaded on change.", (done) => {
                // Verify that new page was loaded.
                expect(toolsObject.before.length > 0).toBe(true);
                expect(toolsObject.after.length > 0).toBe(true);
                expect(spyBefore).toHaveBeenCalled();
                expect(spyBefore.calls.count()).toEqual(1);
                expect(spyAfter).toHaveBeenCalled();
                expect(spyAfter.calls.count()).toEqual(1);
                expect(toolsObject.before).not.toBe(toolsObject.after);
                expect(beforeValue).not.toBe(afterValue);

                done();
            });
        });
    }
};