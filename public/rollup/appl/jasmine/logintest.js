
module.exports = {
    logintest: function (Start) {
        /* 
         * Test Form validation and submission.
         */
        describe("Popup Login Form", function () {
            var modal,
                closeButton,
                mainContainer = "#main_container";

            beforeAll(function (done) {
                $(mainContainer).remove();
                if (!$(mainContainer)[0]) {
                    $("body").append('<div id="main_container"><div class="loading-page"></div></div>');
                }
                $("body").append('<div class="nav-login"><a href="#" class="login">Log in</a></div>');

                Start.initMenu();
                Start.base = true;
                Start["div .login click"]();

                var loginObject = $("div .login");

                //Not bothering with a promise.
                setTimeout(function () {
                    done();
                }, 100);
            });

            it("Login form - verify modal with login loaded", function (done) {

                modal = $("#modalTemplate");
                var nameObject = $("#inputUsername");

                expect(modal[0]).toBeInDOM();
                expect(nameObject[0]).toExist();

                closeButton = $("button.close-modal");
                
                closeButton.click(function () {
                    setTimeout(function () {
                        expect(modal[0]).not.toBeInDOM();
                        expect(modal[0]).not.toExist();
                    }, 100);
                });
                
                done();
            });

            it("Login form - verify cancel and removed from DOM", function () {
                
                expect(modal[0]).toExist();
                closeButton.click();
                
                setTimeout(function() { closeButton.click(); }, 500);
                
            });

        });
    }
};