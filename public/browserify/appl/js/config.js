//Browserify/Karma/Font-Awesome gets a 404 retrieving the fonts, just ignoring them for Karma tests
require("@fortawesome/fontawesome-free/js/all.js");
require("@fortawesome/fontawesome-free/js/fontawesome.js");
if(window.__karma__) {
    require("../css/appKarma.css");
    require("../css/site.css");
}
else {
    require("../css/app.css");
    require("../css/site.css");
    // require("../../../node_modules/jsoneditor/dist/img/jsoneditor-icons.svg");
}

