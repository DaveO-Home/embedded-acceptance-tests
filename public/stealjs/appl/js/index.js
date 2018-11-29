
steal("app",
    "router",
    "default",
    "helpers",
    "setup",
    "config",
    "node_modules/bootstrap/dist/css/bootstrap.min.css",
    "node_modules/tablesorter/dist/css/theme.blue.min.css",
    "node_modules/tablesorter/dist/css/jquery.tablesorter.pager.min.css" , 
    "node_modules/font-awesome/css/font-awesome.css",
    "stealjs/appl/css/site.css",
    function (App, Router,  Default, Helpers, Setup) {
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
                // See apptest.js (window.tests()) to start testing
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
                apptest(Route, Helpers, App);       
            });
        }
        //!steal-remove-end
    });

