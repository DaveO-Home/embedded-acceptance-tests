
steal("app",
        "basecontrol",
        function (App, Base) {

            return App.controllers.Pdf || (App.controllers.Pdf = new (Base.extend({
                finish: function (options) {

                    $("#pdfDO").attr("src", options.pdfUrl);

                },
                test: function (options) {

                    var toolsUrl = "views/prod/Test.pdf";

                    this.view({
                        local_content: "<iframe id='pdfDO' name='pdfDO' class='col-lg-12' style='height: 750px;'></iframe>",
                        pdfUrl: this.baseUrl + toolsUrl,
                        controller: options.controller
                    });

                }

            }))("#main_container"));
        });