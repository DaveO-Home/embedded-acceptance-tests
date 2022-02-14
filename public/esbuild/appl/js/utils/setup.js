// var { Handlebars } = require("handlebars");
// window.Stache = Handlebars;
var stache = require("can-stache");
window.Stache = stache;
require("can-stache-bindings");

module.exports = {
    init: function () {
        //Show the page
        $("#top-nav").removeAttr("hidden");
        $("#side-nav").removeAttr("hidden");
    }
};
