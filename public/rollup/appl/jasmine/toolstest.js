module.exports = {
    toolstest: function (Route, Helpers, Start) {

        /* 
         * Test that new data are loaded when the select value changes.
         */
        describe("Load new tools page", function () {
            var tools,
                    beforeValue,
                    afterValue,
                    spyToolsEvent,
                    selectorObject,
                    selectorItem,
                    mainContainer = "#main_container",
                    mainHtml = '<div id="main_container"><div class="loading-page"></div></div>';


            beforeAll(function (done) {
                
                $("#dropdown1").remove();
                if (!$(mainContainer)[0]) {
                    $("body").append(mainHtml);
                }
                else
                    $(mainContainer).html(mainHtml);

                //Loading Application Web Page(Treat as a Fixture)
                Route.data.attr("base", true);
                Route.data.attr("controller", "table");
                Route.data.attr("action", "tools");

                //Wait for Web Page to be loaded
                new Promise(function (resolve, reject) {

                    Helpers.isResolved(resolve, reject, "container", 0, 1);

                }).catch(function (rejected) {
                    
                    fail("The Tools Page did not load within limited time: " + rejected);

                }).then(function (resolved) {

                    tools = $("#tools");
                    beforeValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();

//                    selectorObject = $('.jobtype-selector');
                    selectorObject = $('#dropdown0');
                    /*
                     * Jasmine works best with html events not mouse events - onClick my not work here.
                     */
                    selectorItem = $("#dropdown1 a")[1];
                    spyToolsEvent = spyOnEvent(selectorItem, 'select');
                    Helpers.fireEvent(selectorItem, 'select');
                    //Note: if page does not refresh, increase the Timeout time.
                    //Using setTimeout instead of Promise.
                    setTimeout(function () {
                        afterValue = tools.find("tbody").find("tr:nth-child(1)").find("td:nth-child(2)").text();
                        done();
                    }, 100);
                });
            });

            it("setup and click events executed.", function () {

                //jasmine-jquery matchers
                expect('select').toHaveBeenTriggeredOn(selectorItem);
                expect(spyToolsEvent).toHaveBeenTriggered();
//
                expect(tools[0]).toBeInDOM();
                expect('.disabled').toBeDisabled();  //Because of can-event warning, removed all disabled classes for testing
                expect('#dropdown1 a').toHaveLength(3);
                //Required for Firefox
                selectorObject[0] = document.activeElement;
                expect(selectorObject).toBeFocused();

            });

            it("new page loaded on change.", function () {

                //Verify that new page was loaded.
                expect(beforeValue).not.toBe(afterValue);
            });

        });
        return;
    }
};