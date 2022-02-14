const { timer } = require("rxjs");

module.exports = {
    inputtest: function (dodex) {
        /* 
         * Test Dodex input (private content) operation.
         */
        var dodexToggle,
            // dodexElement,
            dodexTopElement,
            card27,
            back1,
            back27,
            mainContainer = "#main_container",
            dblClickEvent = new MouseEvent("dblclick");
        // changeEvent = new Event("change");
        describe("Dodex Input Operation Validation", function () {
            beforeAll(function (done) {
                if (!$(mainContainer)[0]) {
                    $("body").append("<div id=\"main_container\"><div class=\"loading-page\"></div></div>");
                }
                /**
                 * Note, dodex and dodex-input are already loaded from previous Dodex tests.
                 */
                dodexToggle = getElement(".dodex--open");
                dodexToggle.onmousedown = event => {
                    dodex.openDodex(event);
                };

                const numbers = timer(75, 10);
                const observable = numbers.subscribe(timer => {
                    dodexTopElement = getElement(".top--dodex");

                    if ((typeof dodexTopElement !== "undefined" && dodexTopElement.length !== 0) &&
                        dodexTopElement.classList.contains("plus-thousand")) {
                        card27 = getElement(".card27");
                        back27 = getElement(".back27");
                        back1 = getElement(".back1");
                        observable.unsubscribe();
                        done();
                    }
                    else if (timer === 75) {
                        observable.unsubscribe();
                        done();
                    }
                });
            });

            afterAll(function (done) {
                $(".top--dodex").remove();
                done();
            });

            it("Dodex Input - popup on mouse double click", function (done) {
                let popupElement = getElement("#dodexInput");
                expect(popupElement).toBe(null);
                card27.dispatchEvent(dblClickEvent);
                popupElement = getElement("#dodexInput");
                expect(popupElement).toBeDefined();
                let numbers = timer(75, 10);
                let observable = numbers.subscribe(timer => {
                    const target = getElement(".content-input");
                    // Waiting for the popup to fade in
                    if (getComputedStyle(target).opacity === "1") {
                        expect(isVisible(target)).toBeTruthy();
                        observable.unsubscribe();
                        done();
                    } else if (timer === 75) {
                        observable.unsubscribe();
                        done();
                    }
                });
            });

            it("Dodex Input - Verify that form elements exist", function (done) {
                const inputs = getAllElements("input");
                expect(inputs[0].type).toMatch("file");
                expect(inputs[1].value).toMatch("replace");
                expect(inputs[2].value).toMatch("append");
                done();
            });

            it("Dodex Input - verify that uploaded file is processed", function (done) {
                // Emulate file upload
                var file = new File([testContent], "content.private.json", { type: "application/json", lastModified: Date.now() });
                var fArray = [file];

                // The file upload handler is exposed for testing only.
                window.handleFileSelect(null, fArray);
                const numbers = timer(75, 10);
                const observable = numbers.subscribe(timer => {
                    const results = getElement("#results");

                    if (results.innerHTML) {
                        expect(results.innerHTML).toContain("Processed Cards:");
                        back27 = document.querySelector(".back27 > p");
                        expect(back27.innerHTML).toMatch("Test Content");
                        expect(back1.querySelector("div").innerHTML).toMatch("Back - First Page");
                        done();
                        observable.unsubscribe();
                    }
                    else if (timer === 75) {
                        done();
                        observable.unsubscribe();
                    }
                });
            });

            it("Dodex Input - close popup on button click", function (done) {
                const closeElement = getElement(".close");
                closeElement.click();

                const numbers = timer(75, 10);
                const observable = numbers.subscribe(timer => {
                    // have to wait for the fade out to finish
                    if (getComputedStyle(getElement(".content-input")).opacity === "0") {
                        const target = getElement(".content-input");
                        expect(isVisible(target)).toBeFalsy();
                        observable.unsubscribe();
                        done();
                    } else if (timer === 75) {
                        observable.unsubscribe();
                        done();
                    }
                });
            });

        });
    }
};

function getElement(element) {
    return document.querySelector(element);
}

function getAllElements(element) {
    return document.querySelector("#dodexInput").querySelectorAll(element);
}

function isVisible(elem) {
    if (getComputedStyle(elem).zIndex === "-1000" || getComputedStyle(elem).opacity == "0") {
        return false;
    }
    else {
        // per jQuery
        return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
    }
}

var testContent = `{
	"cards": {
		"card1": {
			"tab": "A",
			"front": {
				"content": "<h1>Application Access</h1><div class='mr-2'>Log in:<a href='#' class='login'><i class='fa fa-sign-in-alt'></i></a></div>"
			},
			"back": {
				"content": "<div>Back - First Page</div>"
			}
		},
		"card2": {
			"tab": "B",
			"front": {
				"content": ""
			},
			"back": {
				"content": ""
			}
		},
		"card3": {
			"tab": "C",
			"front": {
				"content": "<h1>Best's Contact Form</h1><a href='#!contact'><i class='fa fa-fw fa-phone'></i>Contact</a>"
			},
			"back": {
				"content": "<h1>Lorem Ipsum</h1><a href='https://www.yahoo.com' target='_'>Yahoo13</a>"
			}
		},
		"card4": {
			"tab": "D",
			"front": {
				"content": ""
			},
			"back": {
				"content": ""
			}
		},
		"card5": {
			"tab": "E",
			"front": {
				"content": ""
			},
			"back": {
				"content": ""
			}
		},
		"card6": {
			"tab": "F",
			"front": {
				"content": ""
			},
			"back": {
				"content": ""
			}
		},
		"card16": {
			"tab": "P",
			"front": {
				"content": "<h1>Test Pdf</h1><a href='#!pdf/test'><i class='fa fa-fw far fa-file-pdf'></i>PDF View</a>"
			},
			"back": {
				"content": "<h1>Lorem Ipsum</h1><a href='https://www.yahoo.com' target='_'>Yahoo16</a>"
			}
		},
		"card20": {
			"tab": "T",
			"front": {
				"content": "<h1>Test Table</h1><a href='#!table/tools'><i class='fa fa-fw fa-table'></i>Table View</a>"
			},
			"back": {
				"content": "<h1>Lorem Ipsum</h1><a href='https://www.yahoo.com' target='_'>Yahoo20</a>"
			}
		},
		"card8": {
			"tab": "H",
			"front": {
				"content": "<h1>Description</h1><a href='#!'><i class='fa fa-fw fa-home'></i>Home</a>"
			},
			"back": {
				"content": "<h1>Lorem Ipsum</h1><a href='https://www.yahoo.com' target='_'>Yahoo8</a>"
			}
		},
		"card27": {
			"tab": "",
			"front": {
				"content": ""
			},
			"back": {
				"content": "<h1 style='font-size: 14px;'><svg height='18' width='17' style='font-family: 'Open Sans', sans-serif;'><text x='3' y='18' fill='#059'>O</text><text x='0' y='15' fill='#059'>D</text></svg> doDex</h1><br><p>Test Content</p>"
			}
		}
	}
}`;
