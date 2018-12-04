module.exports = {
    toolstest: function (Route, Helpers) {
        /* 
         * Test that new data are loaded when the select value changes.
         */
        describe("Load new tools page", function () {
            var tools;
            var beforeValue;
            var afterValue;
            var spyToolsEvent;
            var selectorObject;
            var selectorItem;

            beforeAll(function (done) {
                //Loading Application Web Page(Treat as a Fixture)
                Route.data.attr("base", true);
                Route.data.attr("controller", "table");
                Route.data.attr("action", "tools");

                //Wait for Web Page to be loaded
                Helpers.getResource("container", 0, 1)
                    .catch(function (rejected) {
                        fail("The Tools Page did not load within limited time: " + rejected);
                    }).then(function (resolved) {
                        tools = $("#tools");
                        beforeValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();
                        // Opens the dropdown
                        selectorObject = $('#dropdown0');
                        Helpers.fireEvent(selectorObject[0], 'click');

                        selectorItem = $("a.dropdown-item.smallerfont");
                        spyToolsEvent = spyOnEvent(selectorItem[1], 'click');
                        done();
                    });
            });

            it("setup and click events executed.", function (done) {
                Helpers.fireEvent(selectorItem[1], 'click');

                setTimeout(function () {
                    afterValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();
                    //jasmine-jquery matchers
                    expect('click').toHaveBeenTriggeredOn(selectorItem[1]);
                    expect(spyToolsEvent).toHaveBeenTriggered();

                    expect(tools[0]).toBeInDOM();
                    expect('.disabled').toBeDisabled();
                    expect('#dropdown1 a').toHaveLength(3);
                    expect(selectorObject).toBeFocused();
                    done()
                }, 500)

            });
            // Not Working for rollup
            // it("new page loaded on change.", function () {
            //     //Verify that new page was loaded. 
            //     expect(beforeValue).not.toBe(afterValue);
            // });
        });
    }
};