
steal("start", "rxjs", function (Start, Rxjs) {
    return function (dodex, content) {
        /* 
         * Test Dodex operation.
         */
        var timer = Rxjs.timer;
        var dodexElement,
            dodexToggle,
            dodexTopElement,
            card1,
            card2,
            front1,
            front2,
            back1,
            back2,
            // dialRight,
            // dialLeft,
            mainContainer = "#main_container",
            mouseEvent = new MouseEvent('mousedown');

        describe("Dodex Operation Validation", function () {
            beforeAll(function (done) {
                if (!$(mainContainer)[0]) {
                    $("body").append('<div id="main_container"><div class="loading-page"></div></div>');
                }
                
                dodex.setContentFile("../dodex/data/content.js");
                dodex.init({})
                    .then(function () {
                        dodexToggle = getElement(".dodex--open");
                        dodexToggle.onmousedown = event => {
                            dodex.openDodex(event);
                        };
                        dodexToggle.onmousedown(); // Make visible

                        const numbers = timer(100, 10);
                        const observable = numbers.subscribe(timer => {
                            dodexTopElement = getElement(".top--dodex");

                            if ((typeof dodexTopElement !== "undefined" && dodexTopElement.length !== 0) &&
                                dodexTopElement.classList.contains("plus-thousand")) {
                                dodexElement = getElement(".dodex");
                                card1 = getElement(".card1");
                                front1 = getElement(".front1");
                                back1 = getElement(".back1");
                                card2 = getElement(".card2");
                                front2 = getElement(".front2");
                                back2 = getElement(".back2");
                                // const dials = getAllElements(".dial");
                                // dialRight = dials[0];
                                // dialLeft = dials[1];
                                observable.unsubscribe();
                                done();
                            }
                            else if (timer === 100) {
                                observable.unsubscribe();
                                done();
                            }
                        })
                    });
            });

            afterAll(function (done) {
                $(".top--dodex").remove();
                done()
            });

            it("Dodex - loaded and toggle on icon mousedown", function (done) {
                expect(dodexElement).toBeDefined();
                expect(isVisible(dodexTopElement)).toBeTruthy();
                dodexToggle.onmousedown();
                expect(isVisible(dodexTopElement)).toBeFalsy();
                dodexToggle.onmousedown(); // Make visible again
                
                done();
            });

            it("Dodex - Check that card A is current and flipped on mousedown", function (done) {
                expect(card1.style.zIndex).toMatch('');
                expect(card2.style.zIndex).toMatch('');

                // Needed to generate proper event.target
                front1.onmousedown = dodexElement.onmousedown; // Generic dodex handler for all cards.
                front1.dispatchEvent(mouseEvent);

                expect(card1.style.zIndex === "0").toBeTruthy();
                expect(card1.style.transform).toContain("rotateX(-190deg)");
                expect(card2.style.zIndex).toMatch("");
                expect(card2.style.transform).toMatch("");

                done();
            });

            it("Dodex - Check that card B is current and flipped on mousedown", function (done) {
                expect(card2.style.zIndex).toMatch("");
                expect(card2.style.transform).toMatch("");

                front2.onmousedown = dodexElement.onmousedown;
                front2.dispatchEvent(mouseEvent);

                expect(card1.style.zIndex === "0").toBeTruthy();
                expect(card2.style.zIndex).toMatch("1");
                expect(card1.style.transform).toContain("rotateX(-190deg)");
                expect(card2.style.transform).toMatch(/rotateX\(-190deg\)/);

                done();
            });

            it("Dodex - Flip cards A & B back to original positions", function (done) {
                back2.onmousedown = dodexElement.onmousedown;
                back2.dispatchEvent(mouseEvent);

                expect(card1.style.zIndex === "0").toBeTruthy();
                expect(card1.style.transform).toContain("rotateX(-190deg)");
                expect(card2.style.zIndex).toMatch("");
                expect(card2.style.transform).toMatch("");

                back1.onmousedown = dodexElement.onmousedown;
                back1.dispatchEvent(mouseEvent);

                expect(card1.style.zIndex).toMatch('');
                expect(card1.style.transform).toMatch("");
 
                done();
            });

            it("Dodex - Flip multiple cards on tab mousedown", function (done) {
                // Make sure all cards are in original position
                var x, card;
                for (x = 1; x < 14; x++) {
                    card = getElement(".card" + x);
                    expect(card.style.zIndex).toBe('');
                }

                var frontM = getElement(".front13");
                frontM.onmousedown = dodexElement.onmousedown;
                frontM.dispatchEvent(mouseEvent);
                // When tab M is clicked, it and all previous cards should be flipped.
                for (x = 1; x < 14; x++) {
                    card = getElement(".card" + x);
                    expect(card.style.transform).toMatch(/rotateX\(-190deg\)/);
                }

                // Card N should be top card.
                card = getElement(".card14");
                expect(card.style.transform).toMatch("");

                // front works here because the pseudo tab element does not have a back.
                front1.dispatchEvent(mouseEvent);
                // All cards should be back in original position;
                for (x = 13; x > 0; x--) {
                    card = getElement(".card" + x);
                    expect(card.style.transform).toBe('');
                }

                done();
            });

            // Mousemove is difficult to emulate. Would have to pass test indicator to the handler.
            // it("Dodex - Flip Cards using Dials", function (done) {
            //     dialLeft.onmousedown();
            //     dialLeft.onmousemove();
            //     done();
            // });

            it("Dodex - Add additional app/personal cards", function (done) {
                let card28 = getElement(".card28");
                let card29 = getElement(".card29");

                expect(card28).toBeNull();
                expect(card29).toBeNull();

                for (var i = 0; i < 2; i++) {
                    dodex.addCard(content); // content comes from app index.js
                }
                card28 = getElement(".card28");
                card29 = getElement(".card29");

                expect(card28).toHaveClass("card");
                expect(card29).toHaveClass("card");

                var tab = window.getComputedStyle(
                    card28.querySelector('.front28'), ':after'
                ).getPropertyValue('content')
                
                expect(tab).toBe('"F01"');

                done();
            });

            it("Dodex - Load Login Popup from card1(A)", function (done) {
                const clickHandler = function(event) {
                    Start["div .login click"](event.target, event);
                }
                var modal, nameObject;
                var login = front1.querySelector(".login");
                login.onclick = clickHandler;
                login.dispatchEvent(new Event("click"));
                const numbers = timer(100, 10);
                    const observable = numbers.subscribe(timer => {
                        modal = $("#modalTemplate");
                        if ((typeof modal[0] !== "undefined" && modal[0].length !== 0) || timer === 75) {
                            nameObject = document.querySelector("#inputUsername");
                            modal.on('shown.bs.modal', function (html) {
                                modal.modal("toggle");
                            });
                            expect(modal[0]).toHaveClass("modal");
                            expect(nameObject).toHaveClass("form-control");
                            modal.modal("hide");
                            observable.unsubscribe();
                            done();
                        }
                    })
            });
        });
    }
});

function getElement(element) {
    return document.querySelector(element);
}

function getAllElements(element) {
    return document.querySelector(".top--dodex").querySelectorAll(element);
}

function isVisible(elem) {
    if (getComputedStyle(elem).zIndex === "-1000") {
        return false;
    }
    else {
        // per jQuery
        return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
    }
}
