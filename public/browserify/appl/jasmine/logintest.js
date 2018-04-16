module.exports = {
    logintest: function (Start) {
        /* 
         * Test Form validation and submission.
         */
        describe("Popup Login Form", function () {
            var modal;
            var closeButton;
            var nameObject;
            var mainContainer = "#main_container";

            beforeAll(function (done) {
                if (!$(mainContainer)[0]) {
                    $("body").append('<div id="main_container"><div class="loading-page"></div></div>');
                }
                $("body").append('<div class="nav-login"><a href="#" class="login">Log in</a></div>');

                Start.initMenu();
                Start.base = true;
                var loginObject = $("div .login")[0];

                loginObject.click();

                // Not bothering with a promise.
                setTimeout(function () {
                    modal = $("#modalTemplate");
                    nameObject = $("#inputUsername");
                    done();
                }, 500);
            });

            afterAll(function () {

            });

            it("Login form - verify modal with login loaded", function (done) {
                expect(modal[0]).toBeInDOM();
                expect(nameObject[0]).toExist();

                closeButton = $(".close-modal");
                closeButton.submit(function (ev) {
                    ev.preventDefault();
                    modal.modal("toggle");
                    return false;
                });

                done();
            });

            it("Login form - verify cancel and removed from DOM", function (done) {
                expect(modal[0]).toExist();

                closeButton.click();

                setTimeout(function () {
                    $("div .login").remove();
                    expect(modal[0]).not.toBeVisible();
                    expect(modal[0]).not.toBeInDOM();
                    done()
                }, 750);
            });
        });
    }
};