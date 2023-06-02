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
                spyBefore,
                spyAfter,
                selectorObject,
                toolsObject;

            beforeAll(function (done) {
                if (!$("#main_container").length) {
                    $("body").append("<div id=\"main_container\"><div class=\"loading-page\"></div></div>");
                }
                //Loading Application Web Page(Treat as a Fixture)
                Route.data.attr("base", true);
                Route.data.attr("controller", "table");
                Route.data.attr("action", "tools");

                //Wait for Web Page to be loaded
                Helpers.getResource("container", 0, 1)
                    .catch(function (rejected) {
                        fail("The Tools Page did not load within limited time: " + rejected);
                    }).then(function () {
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

            it("setup and change event executed.", function () {
                expect(tools[0]).toBeInDOM();
                expect(".disabled").toBeDisabled();  //Because of can-event warning, removed all disabled classes for testing
                expect(".jobtype-selector > option").toHaveLength(4);
                //Required for Firefox
                selectorObject[0] = document.activeElement;
                expect(selectorObject).toBeFocused();
            });

            it("new page loaded on change.", function () {
                //Verify that new page was loaded.
                expect(toolsObject.before.length > 0).toBe(true);
                expect(toolsObject.after.length > 0).toBe(true);
                expect(spyBefore).toHaveBeenCalled();
                expect(spyBefore.calls.count()).toEqual(1);
                expect(spyAfter).toHaveBeenCalled();
                expect(spyAfter.calls.count()).toEqual(1);
                expect(toolsObject.before).not.toBe(toolsObject.after);
                expect(beforeValue).not.toBe(afterValue);
            });
        });
    }
};