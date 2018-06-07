module.exports = {
    contacttest: function (Route, Helpers) {

        /* 
         * Test Form validation and submission.
         */
        describe("Contact Form Validation", function () {
            var contact,
                    submitObject,
                    nameObject,
                    emailObject,
                    commentObject,
                    mainContainer = "#main_container";

            beforeAll(function (done) {

                if (!$(mainContainer)[0]) {
                    $("body").append('<div id="main_container"><div class="loading-page"></div></div>');
                }

                Route.data.attr("base", "true");
                Route.data.attr("selector", mainContainer);
                Route.data.attr("controller", "contact");

                done();
            });

            it("Contact form - verify required fields", function (done) {

                new Promise(function (resolve, reject) {

                    Helpers.isResolved(resolve, reject, "container", 0, 1);

                }).catch(function (rejected) {

                    fail("Contact Page did not load within limited time: " + rejected);

                }).then(function (resolved) {

                    contact = $(mainContainer + " form");
                    nameObject = $("#inputName");
                    emailObject = $("#inputEmail");
                    commentObject = $("#inputComment");

                    expect(nameObject[0].validity.valueMissing).toBe(true);
                    expect(emailObject[0].validity.valueMissing).toBe(true);
                    expect(commentObject[0].validity.valueMissing).toBe(true);
                    expect(contact.find("input[type=checkbox]")[0].validity.valueMissing).toBe(false);  //Not required

                    done();
                });
            });

            it("Contact form - validate populated fields, email mismatch.", function (done) {

                submitObject = contact.find("input[type=submit]");
                
                nameObject.val("me");
                emailObject.val("notanemailaddress");
                commentObject.val("Stuff");

                submitObject.click();
                
                expect(nameObject[0].validity.valueMissing).toBe(false);
                expect(nameObject[0].checkValidity()).toBe(true);
                expect(commentObject[0].validity.valueMissing).toBe(false);
                expect(commentObject[0].checkValidity()).toBe(true);
                expect(emailObject[0].validity.valueMissing).toBe(false);
                expect(emailObject[0].checkValidity()).toBe(false);
                expect(emailObject[0].validity.typeMismatch).toBe(true);

                //expect(contact[0]).toBeInDOM();
                expect(contact[0]).toExist();

                done();
            });

            it("Contact form - validate email with valid email address.", function (done) {
                
                emailObject.val("ace@ventura.com");

                expect(emailObject[0].validity.typeMismatch).toBe(false);
                expect(emailObject[0].checkValidity()).toBe(true);

                done();
            });

            it("Contact form - validate form submission.", function (done) {

                submitObject.click();
                
                setTimeout(function () {
                    expect($(mainContainer + " form")[0]).not.toBeInDOM();
                    expect($(mainContainer + " form")[0]).not.toExist();
                    done();
                }, 100);

            });
        });
    }
};