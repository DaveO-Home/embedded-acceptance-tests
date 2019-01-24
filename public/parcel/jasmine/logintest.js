const { timer } = require('rxjs');

module.exports = {
    logintest: function (Start) {
        /* 
         * Test popup modal for login.
         */
        describe("Popup Login Form", function () {
            var modal;
            var closeButton;
            var nameObject;
 
            beforeAll(function (done) {
                Start.initMenu();
                Start.base = true;
                var loginObject = $("div .login")[0];

                loginObject.click();

                // Note: if page does not refresh, increase the timer time.
                // Using RxJs instead of Promise.
                const numbers = timer(50, 50);
                const observable = numbers.subscribe(timer => {
                    modal = $("#modalTemplate");
                    if ((typeof modal[0] !== "undefined" && modal[0].length !== 0) || timer === 20) {
                        nameObject = $("#inputUsername");
                        modal.on('shown.bs.modal', function (html) {
                            modal.modal("toggle");
                        });
                        observable.unsubscribe();
                        done();
                    }
                });
            });

            it("Login form - verify modal with login loaded", function (done) {
                expect(modal[0]).toBeInDOM();
                expect(nameObject[0]).toExist();
                done();
            });

            it("Login form - verify cancel and removed from DOM", function (done) {
                expect(modal[0]).toExist();
                modal.modal("hide");
                const numbers = timer(50, 50);
                const observable = numbers.subscribe(timer => {
                    const modal2 = $("#modalTemplate");
                    if (typeof modal2[0] === 'undefined' || timer === 25) {
                        expect(modal[0]).not.toBeVisible();
                        expect(modal[0]).not.toBeInDOM();
                        $("div .login").remove(); // Just cleaning up page for tdd
                        observable.unsubscribe();
                        done();
                    }
                });
            });
        });
    }
};