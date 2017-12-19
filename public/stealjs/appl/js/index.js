
steal("app",
        "router",
        "default",
        "setup",
        "helpers",
        "config",
        function (App, Router, Default, Setup, Helpers) {

            App.init(Default);

            var Route = Router.init();

            Setup.init();

            steal.dev.log("App Started");

//Code between the ..start and ..end tags will be removed by steal-tools during the production build.
//!steal-remove-start
            //testit is true if running under Karma - see testapp_dev.html
            if (typeof testit !== "undefined" && testit) {
                //Run acceptance tests.
                steal.loader.import("apptest").then(function (apptest) {

                    apptest(Route, Helpers, App);
                    setTimeout(()=>{window.tests()}, 500);     //See include-all-tests.js                    
                    
                });
            }
//!steal-remove-end
        });

