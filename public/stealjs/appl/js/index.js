
steal("app",
    "router",
    "default",
    "helpers",
    "setup",
    "dodex",
    "dodex-input",
    "dodex-mess",
    "jsoneditor",
    "config",
    "css",
    "bootstrap",
    function (App, Router, Default, Helpers, Setup, Dodex, Input, Mess, Jsoneditor) {
// require("../../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js");
        window.JSONEditor = Jsoneditor;
	const server = window.location.hostname + (window.location.port.length > 0 ? ":" + window.location.port : "");
        if ((typeof testit === "undefined" || !testit)) {
            // Content for cards A-Z and static card
            Dodex.setContentFile("./dodex/data/content.js");
            Dodex.init({
                width: 375,
                height: 200,
                left: "50%",
                top: "100px",
                input: Input,    	// required if using frontend content load
                private: "full",    // frontend load of private content, "none", "full", "partial"(only cards 28-52) - default none
                replace: true,    	// append to or replace default content - default false(append only)
                mess: Mess,         // requires a server backed by a database, see "node_modules/dodex-mess/server"
                server: server      // configured websocket server for mess
            })
                .then(function () {
                    // Add in app/personal cards
                    for (var i = 0; i < 3; i++) {
                        Dodex.addCard(getAdditionalContent());
                    }
                    /* Auto display of widget */
                    // dodex.openDodex();
                });
        }

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
                jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
                apptest(Route, Helpers, App, Dodex, Input, getAdditionalContent());
            });
        }
        //!steal-remove-end
    });

function getAdditionalContent() {
    return {
        cards: {
            card28: {
                tab: "F01999", //Only first 3 characters will show on the tab.
                front: {
                    content: `<h1 style="font-size: 10px;">Friends</h1>
                        <address style="width:385px">
                            <strong>Charlie Brown</strong> 	111 Ace Ave. Pet Town
                            <abbr title="phone"> : </abbr>555 555-1212<br>
                            <abbr title="email" class="mr-1"></abbr><a href="mailto:cbrown@pets.com">cbrown@pets.com</a>
                        </address>
                        `
                },
                back: {
                    content: `<h1 style="font-size: 10px;">More Friends</h1>
                        <address style="width:385px">
                            <strong>Lucy</strong> 113 Ace Ave. Pet Town
                            <abbr title="phone"> : </abbr>555 555-1255<br>
                            <abbr title="email" class="mr-1"></abbr><a href="mailto:lucy@pets.com">lucy@pets.com</a>
                        </address>
                        `
                }
            },
            card29: {
                tab: "F02",
                front: {
                    content: "<h1 style=\"font-size: 14px;\">My New Card Front</h1>"
                },
                back: {
                    content: "<h1 style=\"font-size: 14px;\">My New Card Back</h1>"
                }
            }
        }
    };
}
