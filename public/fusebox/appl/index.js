/* develblock:start */
//if(!window.__karma__) {
//   require ("./js/hmr"); 
//}
window._bundler = "fusebox";
/* develblock:end */

window.Popper = require("popper.js");

var App = require("app");
var Router = require("router");
var Default = require("default");
var Setup = require("setup");
var Helpers = require("helpers");
require("config");
require("pager");

var dodex = require("dodex").default;
var input = require("dodex-input").default;

if ((typeof testit === "undefined" || !testit)) {
	// Content for cards A-Z and static card
	dodex.setContentFile("./dodex/data/content.js");
	dodex.init({
		width: 375,
		height: 200,
		left: "50%",
		top: "100px",
		input: input,    	// required if using frontend content load
		private: "full", 	// frontend load of private content, "none", "full", "partial"(only cards 28-52) - default none
		replace: true    	// append to or replace default content - default false(append only)
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
if (testit) { 
    var apptest = require("apptest").apptest;

    //Run acceptance tests. - To run only unit tests, comment the apptest call.
    apptest(Route, Helpers, App, dodex, input, getAdditionalContent());
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
    setTimeout(function () {
        __karma__.start();
    }, 750);
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
	};
}
