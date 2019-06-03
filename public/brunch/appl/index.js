/* develblock:start */
window._bundler = "brunch";
/* develblock:end */

window.Popper = require("popper.js");

var App = require("./js/app");
var Router = require("./js/router");
var Default = require("./js/utils/default");
var Setup = require("./js/utils/setup");
var Helpers = require("./js/utils/helpers");
/* eslint no-unused-vars: 0 */
var Config = require("./js/config");
require("pager");

var dodex = require("dodex").default;

if ((typeof testit === "undefined" || !testit)) {
	// Content for cards A-Z and static card
	dodex.setContentFile("./dodex/data/content.js");
	dodex.init({
		width: 375,
		height: 200,
		left: "50%",
		top: "100px"
	})
		.then(function () {
			// Add in app/personal cards
			for (var i = 0; i < 3; i++) {
				dodex.addCard(getAdditionalContent());
			}
			/* Auto display of widget */
			// dodex.openDodex();
		});
}

App.init(Default);

var Route = Router.init();

Setup.init();

/* develblock:start */
//Code between the ..start and ..end tags will be removed by the BlockStrip plugin during the production build.
//testit is true if running under Karma - see testapp_dev.html
if (typeof testit !== "undefined" && testit) {
    
    var apptest = require("../jasmine/apptest").apptest;

    //Run acceptance tests. - To run only unit tests, comment the apptest call.
    apptest(Route, Helpers, App, dodex, getAdditionalContent());
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
    setTimeout(function () {
        __karma__.start();
    }, 1000);

}
/* develblock:end */

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
	}
}

