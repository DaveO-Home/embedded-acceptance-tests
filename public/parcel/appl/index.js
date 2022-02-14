import "./js/utils/set.globals";

import App from "./js/app";
import Router from "./js/router";
import Default from "./js/utils/default";
import Setup from "./js/utils/setup";
import Helpers from "./js/utils/helpers";
import JSONEditor from "jsoneditor";
/* eslint no-unused-vars: 0 */
import "./js/config";
import "pager";
/* develblock:start */
import { apptest } from "../jasmine/apptest";
window._bundler = "parcel";
/* develblock:end */
window.JSONEditor = JSONEditor;
import dodex from "dodex";
import input from "dodex-input";
import mess from "dodex-mess";

if ((typeof testit === "undefined" || !testit)) {
	const server = window.location.hostname + (window.location.port.length > 0 ? ":" + window.location.port : "");
	// Content for cards A-Z and static card
	dodex.setContentFile("./dodex/data/content.js");
	dodex.init({
		width: 375,
		height: 200,
		left: "50%",
		top: "100px",
		input: input,    	// required if using frontend content load
		private: "full", 	// frontend load of private content, "none", "full", "partial"(only cards 28-52) - default none
		replace: true,    	// append to or replace default content - default false(append only)
		mess: mess,         // requires a server backed by a database, see "node_modules/dodex-mess/server"
		server: server      // configured websocket server for mess
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
	//Run acceptance tests.
    apptest(Route, Helpers, App, dodex, input, getAdditionalContent());
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
