
module.exports = {
    logintest: function (Start) {
        /* 
         * Test popup modal for login.
         */
        describe("Popup Login Form", function () {
            var modal;
            var nameObject;
 
            beforeAll(function (done) {
                Start.initMenu();
                Start.base = true;
                var loginObject = $("div .login")[0];

                loginObject.click();

                // Not bothering with a promise.
                setTimeout(function () {
                    modal = $("#modalTemplate");
                    nameObject = $("#inputUsername");
                    modal.on("shown.bs.modal", function () {
                        modal.modal("toggle");
                    });
                    done();
                }, 500);
            });

            it("Login form - verify modal with login loaded", function (done) {
                expect(modal[0]).toBeInDOM();
                expect(nameObject[0]).toExist();
                done();
            });

            it("Login form - verify cancel and removed from DOM", function (done) {
                expect(modal[0]).toExist();
                modal.modal("hide");
                setTimeout(function () {
                    expect(modal[0]).not.toBeVisible();
                    expect(modal[0]).not.toBeInDOM();
                    $("div .login").remove(); // Just cleaning up page for tdd
                    done();
                }, 750);
            });
        });
    }
};