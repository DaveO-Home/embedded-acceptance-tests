/**
 * Controller for Welcome Page
 */
// import App from "app"
// import Base from "basecontrol"
// import Menu from "menu"
// import Marked from "marked"

steal("app",
    "basecontrol", "menu", "marked",
    function (App, Base , Menu , Marked) {
        var me, location = "#!";

        return App.controllers.Start ||
            (App.controllers.Start = new (Base.extend({
                // export default App.controllers.Start ||
                // (App.controllers.Start = new (Base.extend({
                initMenu: function () {
                    me = this;
                    var hash = window.location.hash;
                    location = hash === "#!contact" ? location : hash;
                    Menu.activate("#top-nav div ul li");
                    Menu.activate("#side-nav nav ul li");
                },
                index: function (options) {
                    var indexUrl = "views/prod/index.html";
                    var markdownUrl = this.base ? "base/README.md" : System.isEnv("development") ? "/README.md" : "/dist/README.md";

                    this.view({
                        url: me.baseUrl + indexUrl,
                        urlMd: markdownUrl,
                        fade: true,
                        controller: "Start",
                        fnLoad: function (el) {
                        }
                    });
                },
                'div .login click': function (sender, e) {
                    e.preventDefault();
                    var loginUrl = "views/prod/login.html";

                    this.modal({
                        baseUrl: me.baseUrl,
                        url: me.baseUrl + loginUrl,
                        title: 'Account Log In',
                        submit: 'Login',
                        submitCss: 'submit-login',
                        widthClass: "modal-lg",
                        width: "30%",
                        foot: me.footer,
                        close: "Close",
                        contactFooter: me.contactFooter
                    });
                },
                '.modal .submit-login click': function (sender, e) {
                    e.preventDefault();

                    alert('Not implemented');
                    $(sender).closest('.modal').modal('hide');
                },
                'div .modal-footer .contact click': function (sender, e) {
                    $(sender).closest('.modal').modal('hide');
                },
                contact: function (ev) {
                    this.view({
                        url: me.baseUrl + "views/prod/contact.html",
                        selector: window.rmain_container || "#main_container",
                        fade: true,
                        contactListener: function (el) {
                            var form = $("form", el);

                            var formFunction = function (e) {
                                //!steal-remove-start
                                if (window.__karma__) {  // To prevent firefox testing from clearing context
                                    e.preventDefault();
                                }
                                //!steal-remove-end
                                var validateForm = function (isValid) {
                                    var inputs = Array.prototype.slice.call(document.querySelectorAll("form input"));
                                    inputs.push(document.querySelector("form textarea"));
                                    for (var i = 0; i < inputs.length; i++) {
                                        isValid = !inputs[i].checkValidity() ? false : isValid;
                                        inputs[i].setCustomValidity("");
                                        if (inputs[i].validity.valueMissing && !isValid) {
                                            inputs[i].setCustomValidity("Please enter data for required field");
                                        }
                                    }
                                    return isValid;
                                };

                                var isValid = validateForm(true) ? true : validateForm(true);
                                if (isValid) {
                                    e.preventDefault();
                                    me.showAlert();
                                    // TODO: do something with collected data
                                    var data = $('form.form-modal').serializeArray()
                                        .reduce(function (a, x) {
                                            a[x.name] = x.value;
                                            return a;
                                        }, {});

                                    var secs = 3000;
                                    //!steal-remove-start
                                    if (window.__karma__) {
                                        secs = 10;
                                    }
                                    //!steal-remove-end
                                    setTimeout(function () {
                                        $("#main_container").empty();
                                        window.location.hash = location;
                                    }, secs);
                                }
                            };
                            form.find("input[type=submit]", el).click(formFunction);
                        }
                    });
                },
                footer: '<button class="btn btn-sm btn-primary submit-modal mr-auto raised submit-login">{{submit}}</button>' +
                    '<button class="btn btn-sm close-modal raised" data-dismiss="modal" aria-hidden="true">{{close}}</button>',
                contactFooter: '<div class="modal-footer">' +
                    '<div class="mr-auto contact" >' +
                    '<a href="#!contact" ><small class="grey">Contact</small></a>' +
                    '</div>' +
                    '</div>',
                alert: '<div class="alert alert-info alert-dismissible fade show" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<strong>Thank You!</strong> Your request is being processed.' +
                    '</div>',
                showAlert: function () {
                    $('form.form-horizontal').append(me.alert);
                },
                finish: function (options) {
                    var mdFunction = function (data) {
                        $(".markdown").append(Marked(data));
                    };
                    $.get(options.urlMd, mdFunction, "text");
                }
            }))(document));
    });
