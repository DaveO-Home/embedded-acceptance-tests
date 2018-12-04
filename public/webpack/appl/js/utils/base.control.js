define("basecontrol", ["app",
    "helpers",
    "can-control"],
    function (App, Helpers, Control) {
        return Control.extend({
            defaults: {
            }
        }, {
                init: function (element, options) {
                },
                view: function (options) {
                    var loading = Helpers.getValueOrDefault(options.loading, false);
                    //Lets not clutter up the test reporting.
                    if (typeof testit != "undefined" && !testit) {
                        if (loading) {
                            console.warn("Loading");    //In lieu of spinner for demo
                        }
                    }

                    var render = Helpers.renderer(this, options);

                    if (options.template) {
                        switch (options.template.split(".")[0]) {
                            case "tools":
                                App.renderTools(options, render);
                                break;
                        }
                    } else {
                        App.loadView(options, function (frag) {
                            render(frag);
                        });
                    }
                },
                modal: function (options) {
                    var me = this
                    var template;

                    App.loadView({
                        url: "templates/stache/modal.stache"
                    }, function (modalFrag) {
                        template = Stache(modalFrag);

                        App.loadView(options, function (frag) {
                            options["body"] = frag;
                            options["foot"] = Stache(options.foot)(options);
                            var el = $(document.body).append(template(options)).find("> .modal").last();
                            var css = {};
                            if (options.width) {
                                css["width"] = typeof css.width === "number"
                                    ? options.width + "%" : options.width;
                                var width = css.width.substring(0, css.width.length - 1);
                                css["margin-left"] = (100 - width) / 2 + "%";
                            }

                            $(el).on("show.bs.modal", function () {
                                if (options.fnLoad)
                                    options.fnLoad(el);

                                me.on();
                            }).on("hide.bs.modal", function () {
                                if (options.fnHide)
                                    options.fnHide(el);
                            }).on("hidden.bs.modal", function () {
                                $(this).remove();
                            }).modal("show").css(css).find("> .modal-dialog").addClass(options.widthClass);
                        });
                    });
                },
                hideModal: function () {
                    //HIDE ANY OPEN MODAL WINDOWS
                    $(".modal.in", this.element).modal("hide");
                }
            });
    });
